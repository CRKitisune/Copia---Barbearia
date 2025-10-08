import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, jidNormalizedUser } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class WhatsAppService {
    constructor() {
        this.authDir = path.join(__dirname, '..', 'auth_info_baileys');
        this.sock = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.currentQRCode = null;
        
        // Garantir que o diretório de autenticação existe
        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }

        // Inicializar arquivos de log se não existirem
        this.initializeLogFiles();
    }

    // Inicializar arquivos de log
    initializeLogFiles() {
        const logsPath = path.join(__dirname, '..', 'database', 'whatsapp_logs.json');
        const templatesPath = path.join(__dirname, '..', 'database', 'message_templates.json');

        if (!fs.existsSync(logsPath)) {
            fs.writeFileSync(logsPath, JSON.stringify([], null, 2));
        }

        if (!fs.existsSync(templatesPath)) {
            const defaultTemplates = {
                confirmation: "Olá {nome}! Seu agendamento para {data} às {horario} está confirmado. Serviço: {servico}",
                cancellation: "Olá {nome}! Infelizmente precisamos cancelar seu agendamento para {data} às {horario}. Motivo: {motivo}",
                reminder: "Olá {nome}! Lembrete: você tem um agendamento hoje às {horario} para {servico}"
            };
            fs.writeFileSync(templatesPath, JSON.stringify(defaultTemplates, null, 2));
        }
    }

    // Log de mensagens
    logMessage(type, message) {
        const logsPath = path.join(__dirname, '..', 'database', 'whatsapp_logs.json');
        const logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        
        logs.push({
            timestamp: new Date().toISOString(),
            type: type,
            message: message
        });

        // Manter apenas os últimos 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }

        fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
    }

    // Conectar ao WhatsApp
    async connect() {
        if (this.isConnected) {
            console.log('✅ WhatsApp já está conectado');
            return { success: true, message: 'WhatsApp já está conectado' };
        }

        if (this.isConnecting) {
            console.log('⏳ Conexão já em andamento...');
            return { success: false, message: 'Conexão já em andamento' };
        }

        try {
            this.isConnecting = true;
            console.log('🔄 Iniciando conexão com WhatsApp...');
            this.logMessage('info', 'Iniciando conexão com WhatsApp');

            const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
            const { version, isLatest } = await fetchLatestBaileysVersion();
            
            console.log(`📱 Usando versão do Baileys: ${version.join('.')}, é a mais recente: ${isLatest}`);

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false, // QR code será exibido no frontend
                browser: ['Barbearia Nativa', 'Chrome', '1.0.0'],
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                defaultQueryTimeoutMs: 60000,
                markOnlineOnConnect: true, // Manter online
                syncFullHistory: false,
                fireInitQueries: false,
                generateHighQualityLinkPreview: false,
                qrTimeout: 60000,
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 3,
                shouldSyncHistoryMessage: () => false, // Não sincronizar histórico
                shouldIgnoreJid: () => false // Não ignorar nenhum JID
            });

            // IMPORTANTE: Configurar eventos ANTES de qualquer operação
            // Salvar credenciais automaticamente
            this.sock.ev.on('creds.update', saveCreds);
            
            // Eventos de mensagens
            this.sock.ev.on('messages.upsert', (m) => {
                const msg = m.messages[0];
                if (!msg.key.fromMe && m.type === 'notify') {
                    console.log('📨 Nova mensagem recebida:', msg.message?.conversation || 'Mídia');
                    this.logMessage('info', 'Nova mensagem recebida');
                }
            });

            // Evento de atualização de conexão
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                console.log('🔄 Connection update:', { connection, hasQR: !!qr });

                if (qr) {
                    // Gerar QR code em Base64 para o frontend
                    try {
                        console.log('📱 QR Code recebido, convertendo para Base64...');
                        const qrBase64 = await QRCode.toDataURL(qr);
                        this.currentQRCode = qrBase64;
                        console.log('✅ QR Code gerado e armazenado:', qrBase64.substring(0, 50) + '...');
                        this.logMessage('info', 'QR Code gerado - aguardando escaneamento');
                    } catch (error) {
                        console.error('❌ Erro ao gerar QR Code:', error);
                        this.logMessage('error', `Erro ao gerar QR Code: ${error.message}`);
                        // Fallback: usar QR string diretamente
                        this.currentQRCode = qr;
                    }
                }

                if (connection === 'open') {
                    console.log('✅ WhatsApp conectado com sucesso!');
                    this.isConnected = true;
                    this.isConnecting = false;
                    this.currentQRCode = null; // Limpar QR code após conexão
                    this.logMessage('success', 'WhatsApp conectado com sucesso');
                    console.log('🔐 Sessão salva automaticamente');
                }

                if (connection === 'close') {
                    console.log('❌ Conexão fechada');
                    this.isConnected = false;
                    this.isConnecting = false;
                    this.currentQRCode = null;

                    const error = lastDisconnect?.error;
                    const statusCode = error?.output?.statusCode;
                    const errorMessage = error?.message || '';

                    console.log('🔍 Detalhes do erro:', {
                        statusCode,
                        error: errorMessage
                    });

                    if (statusCode === DisconnectReason.loggedOut) {
                        console.log('🚪 Logout detectado - sessão removida');
                        this.logMessage('warning', 'Logout do WhatsApp - sessão removida');
                        // Limpar arquivos de autenticação apenas em logout
                        await this.clearSession();
                    } else if (statusCode === DisconnectReason.restartRequired) {
                        console.log('🔄 Reinício necessário - sessão mantida');
                        this.logMessage('warning', 'Reinício necessário - sessão mantida para reconexão');
                        // NÃO limpar sessão em restartRequired - apenas reconectar
                    } else {
                        console.log('❌ Conexão perdida - sessão mantida');
                        this.logMessage('warning', 'Conexão perdida - sessão mantida para reconexão');
                        // NÃO limpar sessão em outros casos - apenas reconectar
                    }
                }
            });

            return { success: true, message: 'Conexão iniciada - escaneie o QR Code' };

        } catch (error) {
            this.isConnecting = false;
            console.error('❌ Erro ao conectar:', error);
            this.logMessage('error', `Erro ao conectar: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    // Desconectar
    async disconnect() {
        try {
            if (this.sock) {
                console.log('🚪 Desconectando WhatsApp...');
                this.logMessage('info', 'Desconectando WhatsApp');
                await this.sock.logout();
                this.sock = null;
            }
            
            this.isConnected = false;
            this.isConnecting = false;
            this.currentQRCode = null;
            
            console.log('✅ WhatsApp desconectado');
            this.logMessage('success', 'WhatsApp desconectado');
            
            return { success: true, message: 'WhatsApp desconectado com sucesso' };
        } catch (error) {
            console.error('❌ Erro ao desconectar:', error);
            this.logMessage('error', `Erro ao desconectar: ${error.message}`);
            return { success: false, message: error.message };
        }
    }

    // Limpar sessão
    async clearSession() {
        try {
            console.log('🗑️ Limpando sessão...');
            
            // Desconectar primeiro
            await this.disconnect();
            
            // Remover arquivos de autenticação
            if (fs.existsSync(this.authDir)) {
                const files = fs.readdirSync(this.authDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(this.authDir, file));
                }
                console.log('✅ Sessão limpa');
                this.logMessage('info', 'Sessão do WhatsApp limpa');
            }
            
        } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
            this.logMessage('error', `Erro ao limpar sessão: ${error.message}`);
        }
    }

    // Enviar mensagem
    async sendMessage(to, message) {
        if (!this.isConnected || !this.sock) {
            throw new Error('WhatsApp não está conectado');
        }

        try {
            // Validar e formatar número
            const phoneNumber = to.replace(/\D/g, '');
            if (phoneNumber.length < 10) {
                throw new Error('Número de telefone inválido');
            }

            const jid = to.includes('@') ? to : `${phoneNumber}@s.whatsapp.net`;
            
            // Para números de teste (começam com 5511), pular verificação
            const isTestNumber = phoneNumber.startsWith('5511') && phoneNumber.length === 13;
            
            if (!isTestNumber) {
                // Verificar se o número existe no WhatsApp apenas para números reais
                const [result] = await this.sock.onWhatsApp(jid);
                if (!result?.exists) {
                    throw new Error(`Número ${phoneNumber} não está registrado no WhatsApp`);
                }
                await this.sock.sendMessage(result.jid, { text: message });
            } else {
                // Para números de teste, enviar diretamente
                await this.sock.sendMessage(jid, { text: message });
            }
            
            console.log(`📤 Mensagem enviada para ${phoneNumber}`);
            this.logMessage('success', `Mensagem enviada para ${phoneNumber}`);
            
            return { 
                success: true, 
                message: 'Mensagem enviada com sucesso',
                recipient: phoneNumber
            };
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            this.logMessage('error', `Erro ao enviar mensagem: ${error.message}`);
            throw error;
        }
    }

    // Obter status da conexão
    getStatus() {
        return {
            connected: this.isConnected,
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            hasQRCode: !!this.currentQRCode,
            qrCode: this.currentQRCode
        };
    }

    // Obter QR code atual
    getCurrentQRCode() {
        return this.currentQRCode;
    }

    // Obter número conectado
    getConnectedUser() {
        if (this.isConnected && this.sock?.user) {
            return {
                id: this.sock.user.id,
                name: this.sock.user.name
            };
        }
        return null;
    }
}

export default WhatsAppService;
