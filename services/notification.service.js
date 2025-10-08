import WhatsAppService from './whatsapp.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class NotificationService {
    constructor() {
        this.whatsappService = new WhatsAppService();
        this.isInitialized = false;
    }

    // Inicializar serviço
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.whatsappService.connect();
            this.isInitialized = true;
            console.log('✅ Serviço de notificações inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar serviço de notificações:', error);
        }
    }

    // Processar novo agendamento
    async processNewAppointment(agendamento) {
        try {
            if (!this.whatsappService.isConnected) {
                console.log('⚠️ WhatsApp não conectado, pulando notificação');
                return;
            }

            // Enviar confirmação imediata
            await this.whatsappService.sendAppointmentConfirmation(agendamento);
            
            console.log(`✅ Confirmação enviada para agendamento ${agendamento.id}`);
            
        } catch (error) {
            console.error('❌ Erro ao processar novo agendamento:', error);
        }
    }

    // Processar agendamento atualizado
    async processUpdatedAppointment(agendamento, oldStatus) {
        try {
            if (!this.whatsappService.isConnected) {
                console.log('⚠️ WhatsApp não conectado, pulando notificação');
                return;
            }

            // Se foi cancelado, enviar notificação de cancelamento
            if (agendamento.status === 'Cancelado' && oldStatus !== 'Cancelado') {
                const template = this.whatsappService.getTemplate('agendamento_cancelado');
                if (template && template.ativo) {
                    const templateData = {
                        cliente_nome: agendamento.cliente_nome,
                        data_agendamento: this.whatsappService.formatDate(agendamento.data_agendamento),
                        horario_agendamento: agendamento.horario_agendamento
                    };
                    
                    await this.whatsappService.sendMessage(
                        agendamento.cliente_telefone, 
                        template.template, 
                        templateData
                    );
                    
                    console.log(`✅ Notificação de cancelamento enviada para agendamento ${agendamento.id}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar agendamento atualizado:', error);
        }
    }

    // Enviar lembretes programados
    async sendScheduledReminders() {
        try {
            if (!this.whatsappService.isConnected) {
                return;
            }

            await this.whatsappService.checkAndSendReminders();
            
        } catch (error) {
            console.error('❌ Erro ao enviar lembretes programados:', error);
        }
    }

    // Obter estatísticas de notificações
    getNotificationStats() {
        try {
            const logs = this.whatsappService.getLogs();
            const today = new Date().toDateString();
            
            const stats = {
                total: logs.length,
                today: logs.filter(log => new Date(log.timestamp).toDateString() === today).length,
                confirmations: logs.filter(log => log.type === 'sent' && log.templateData?.cliente_nome).length,
                reminders: logs.filter(log => log.type === 'reminder').length,
                errors: logs.filter(log => log.status === 'error').length,
                last24h: logs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    const now = new Date();
                    return (now.getTime() - logDate.getTime()) <= 24 * 60 * 60 * 1000;
                }).length
            };
            
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }

    // Verificar agendamentos pendentes de notificação
    async checkPendingNotifications() {
        try {
            const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
            const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
            
            // Buscar agendamentos que precisam de confirmação
            const pendingConfirmations = agendamentos.filter(agendamento => {
                if (agendamento.status !== 'Agendado') return false;
                
                // Verificar se é o dia da consulta
                const appointmentDate = new Date(agendamento.data_agendamento);
                const today = new Date();
                const isToday = appointmentDate.toDateString() === today.toDateString();
                
                if (!isToday) {
                    console.log(`⏰ Agendamento ${agendamento.id} não é hoje (${agendamento.data_agendamento}), pulando confirmação`);
                    return false;
                }
                
                // Verificar se já foi enviada confirmação
                const logs = this.whatsappService.getLogs();
                const hasConfirmation = logs.some(log => 
                    log.agendamento_id === agendamento.id && 
                    log.type === 'sent' &&
                    log.templateData?.cliente_nome === agendamento.cliente_nome
                );
                
                return !hasConfirmation;
            });
            
            return pendingConfirmations;
        } catch (error) {
            console.error('❌ Erro ao verificar notificações pendentes:', error);
            return [];
        }
    }

    // Enviar confirmações pendentes
    async sendPendingConfirmations() {
        try {
            if (!this.whatsappService.isConnected) {
                console.log('⚠️ WhatsApp não conectado, pulando confirmações pendentes');
                return { sent: 0, errors: 0 };
            }

            const pending = await this.checkPendingNotifications();
            let sent = 0;
            let errors = 0;
            
            for (const agendamento of pending) {
                try {
                    await this.whatsappService.sendAppointmentConfirmation(agendamento);
                    sent++;
                    
                    // Pausa entre envios
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`❌ Erro ao enviar confirmação para agendamento ${agendamento.id}:`, error);
                    errors++;
                }
            }
            
            console.log(`✅ Confirmações pendentes: ${sent} enviadas, ${errors} erros`);
            return { sent, errors };
            
        } catch (error) {
            console.error('❌ Erro ao enviar confirmações pendentes:', error);
            return { sent: 0, errors: 1 };
        }
    }

    // Cancelar confirmações - Barbearia não vai abrir
    async cancelConfirmations(reason = 'A barbearia não funcionará hoje') {
        try {

            const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
            const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
            
            // Buscar agendamentos de hoje que estão confirmados
            const today = new Date();
            const todayAppointments = agendamentos.filter(agendamento => {
                if (agendamento.status !== 'Agendado') return false;
                
                const appointmentDate = new Date(agendamento.data_agendamento);
                return appointmentDate.toDateString() === today.toDateString();
            });

            let sent = 0;
            let errors = 0;
            
            console.log(`🚫 Iniciando cancelamento de ${todayAppointments.length} agendamentos de hoje`);
            
            for (const agendamento of todayAppointments) {
                try {
                    // Enviar mensagem de cancelamento
                    const cancelMessage = `🚫 *CANCELAMENTO DE AGENDAMENTO*\n\n` +
                        `Olá ${agendamento.cliente_nome}! 😔\n\n` +
                        `Infelizmente precisamos cancelar seu agendamento de hoje (${this.whatsappService.formatDate(agendamento.data_agendamento)}) às ${agendamento.horario_agendamento}.\n\n` +
                        `*Motivo:* ${reason}\n\n` +
                        `Pedimos desculpas pelo inconveniente. Entre em contato conosco para reagendar seu horário.\n\n` +
                        `📞 *Barbearia Nativa*\n` +
                        `💬 WhatsApp: (11) 99999-9999`;

                    await this.whatsappService.sendMessage(agendamento.cliente_telefone, cancelMessage);
                    
                    // Atualizar status do agendamento para cancelado
                    agendamento.status = 'Cancelado';
                    agendamento.observacoes = `Cancelado automaticamente: ${reason}`;
                    
                    sent++;
                    
                    // Pausa entre envios
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`❌ Erro ao cancelar agendamento ${agendamento.id}:`, error);
                    errors++;
                }
            }
            
            // Salvar alterações no arquivo
            if (sent > 0) {
                fs.writeFileSync(agendamentosPath, JSON.stringify(agendamentos, null, 2));
            }
            
            console.log(`✅ Cancelamentos: ${sent} enviados, ${errors} erros`);
            return { sent, errors, total: todayAppointments.length };
            
        } catch (error) {
            console.error('❌ Erro ao cancelar confirmações:', error);
            return { sent: 0, errors: 1, total: 0 };
        }
    }

    // Status do serviço
    getStatus() {
        return {
            initialized: this.isInitialized,
            whatsappConnected: this.whatsappService.isConnected,
            stats: this.getNotificationStats()
        };
    }
}

export default NotificationService;
