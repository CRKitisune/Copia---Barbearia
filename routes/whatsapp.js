import express from 'express';
const router = express.Router();
import WhatsAppService from '../services/whatsapp.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Instância única do serviço WhatsApp
let whatsappService = null;

// Middleware para garantir que o serviço está inicializado
const requireWhatsAppService = (req, res, next) => {
    if (!whatsappService) {
        whatsappService = new WhatsAppService();
    }
    req.whatsappService = whatsappService;
    next();
};

// GET /api/whatsapp/status - Obter status da conexão
router.get('/status', requireWhatsAppService, (req, res) => {
    try {
        const status = req.whatsappService.getStatus();
        const user = req.whatsappService.getConnectedUser();
        
        res.json({
            success: true,
            data: {
                ...status,
                user: user
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao obter status',
            message: error.message
        });
    }
});

// POST /api/whatsapp/connect - Conectar ao WhatsApp
router.post('/connect', requireWhatsAppService, async (req, res) => {
    try {
        const result = await req.whatsappService.connect();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao conectar',
            message: error.message
        });
    }
});

// POST /api/whatsapp/disconnect - Desconectar do WhatsApp
router.post('/disconnect', requireWhatsAppService, async (req, res) => {
    try {
        const result = await req.whatsappService.disconnect();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao desconectar',
            message: error.message
        });
    }
});

// POST /api/whatsapp/clear-session - Limpar sessão
router.post('/clear-session', requireWhatsAppService, async (req, res) => {
    try {
        await req.whatsappService.clearSession();
        res.json({
            success: true,
            message: 'Sessão limpa com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar sessão',
            message: error.message
        });
    }
});

// GET /api/whatsapp/qr-code - Obter QR code atual
router.get('/qr-code', requireWhatsAppService, (req, res) => {
    try {
        const qrCode = req.whatsappService.getCurrentQRCode();
        res.json({
            success: true,
            data: {
                qrCode: qrCode,
                hasQRCode: !!qrCode
            },
            message: qrCode ? 'QR Code disponível' : 'Nenhum QR Code disponível'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao obter QR Code',
            message: error.message
        });
    }
});

// POST /api/whatsapp/send-message - Enviar mensagem individual
router.post('/send-message', requireWhatsAppService, async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: to, message'
            });
        }

        const result = await req.whatsappService.sendMessage(to, message);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar mensagem',
            message: error.message
        });
    }
});

// POST /api/whatsapp/send-bulk-confirmations - Enviar confirmações em lote
router.post('/send-bulk-confirmations', requireWhatsAppService, async (req, res) => {
    try {
        const service = req.whatsappService;
        
        if (!service.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado',
                message: 'Conecte o WhatsApp antes de enviar confirmações'
            });
        }

        // Buscar agendamentos de hoje pendentes
        const today = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo de agendamentos não encontrado'
            });
        }

        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
                const agendamentosHoje = agendamentos.filter(apt => 
                    apt.data_agendamento === today && (apt.status === 'pendente' || apt.status === 'Agendado')
                );

        if (agendamentosHoje.length === 0) {
            return res.json({
                success: true,
                message: 'Nenhum agendamento pendente para hoje',
                data: {
                    sent: 0,
                    total: 0
                }
            });
        }

        let sentCount = 0;
        const results = [];

        // Buscar dados dos clientes e serviços
        const clientesPath = path.join(__dirname, '..', 'database', 'clientes.json');
        const servicosPath = path.join(__dirname, '..', 'database', 'servicos.json');
        
        const clientes = fs.existsSync(clientesPath) ? JSON.parse(fs.readFileSync(clientesPath, 'utf8')) : [];
        const servicos = fs.existsSync(servicosPath) ? JSON.parse(fs.readFileSync(servicosPath, 'utf8')) : [];

        for (const agendamento of agendamentosHoje) {
            try {
                const cliente = clientes.find(c => c.id === agendamento.cliente_id);
                const servico = servicos.find(s => s.id === agendamento.servico_id);
                
                if (!cliente || !cliente.telefone) {
                    results.push({
                        agendamento_id: agendamento.id,
                        status: 'erro',
                        message: 'Cliente não encontrado ou sem telefone'
                    });
                    continue;
                }

                        const horario = agendamento.horario || agendamento.horario_agendamento;
                        const message = `Olá ${cliente.nome}! 

Confirmação de agendamento:

📅 Data: ${new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
⏰ Horário: ${horario}
✂️ Serviço: ${servico ? servico.nome : 'Não especificado'}

Por favor, confirme sua presença respondendo esta mensagem.

Barbearia Nativa`;

                await service.sendMessage(cliente.telefone, message);
                
                // Atualizar status do agendamento
                agendamento.status = 'confirmado';
                agendamento.confirmado_em = new Date().toISOString();
                
                sentCount++;
                results.push({
                    agendamento_id: agendamento.id,
                    status: 'enviado',
                    message: 'Confirmação enviada com sucesso'
                });

            } catch (error) {
                results.push({
                    agendamento_id: agendamento.id,
                    status: 'erro',
                    message: error.message
                });
            }
        }

        // Salvar agendamentos atualizados
        fs.writeFileSync(agendamentosPath, JSON.stringify(agendamentos, null, 2));

        res.json({
            success: true,
            message: `Confirmações enviadas: ${sentCount}/${agendamentosHoje.length}`,
            data: {
                sent: sentCount,
                total: agendamentosHoje.length,
                results: results
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar confirmações',
            message: error.message
        });
    }
});

// POST /api/whatsapp/cancel-confirmations - Cancelar confirmações do dia
router.post('/cancel-confirmations', requireWhatsAppService, async (req, res) => {
    try {
        const service = req.whatsappService;
        
        if (!service.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado',
                message: 'Conecte o WhatsApp antes de cancelar confirmações'
            });
        }

        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({
                success: false,
                error: 'Motivo do cancelamento é obrigatório'
            });
        }

        // Buscar agendamentos de hoje
        const today = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo de agendamentos não encontrado'
            });
        }

        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
                const agendamentosHoje = agendamentos.filter(apt => 
                    apt.data_agendamento === today && (apt.status === 'pendente' || apt.status === 'confirmado' || apt.status === 'Agendado')
                );

        if (agendamentosHoje.length === 0) {
            return res.json({
                success: true,
                message: 'Nenhum agendamento para cancelar hoje',
                data: {
                    cancelledCount: 0,
                    total: 0
                }
            });
        }

        let cancelledCount = 0;
        const results = [];

        // Buscar dados dos clientes e serviços
        const clientesPath = path.join(__dirname, '..', 'database', 'clientes.json');
        const servicosPath = path.join(__dirname, '..', 'database', 'servicos.json');
        
        const clientes = fs.existsSync(clientesPath) ? JSON.parse(fs.readFileSync(clientesPath, 'utf8')) : [];
        const servicos = fs.existsSync(servicosPath) ? JSON.parse(fs.readFileSync(servicosPath, 'utf8')) : [];

        for (const agendamento of agendamentosHoje) {
            try {
                const cliente = clientes.find(c => c.id === agendamento.cliente_id);
                const servico = servicos.find(s => s.id === agendamento.servico_id);
                
                if (!cliente || !cliente.telefone) {
                    results.push({
                        agendamento_id: agendamento.id,
                        status: 'erro',
                        message: 'Cliente não encontrado ou sem telefone'
                    });
                    continue;
                }

                        const horario = agendamento.horario || agendamento.horario_agendamento;
                        const message = `Olá ${cliente.nome}! 

Infelizmente precisamos cancelar seu agendamento:

📅 Data: ${new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
⏰ Horário: ${horario}
✂️ Serviço: ${servico ? servico.nome : 'Não especificado'}

Motivo: ${reason}

Pedimos desculpas pelo inconveniente. Entre em contato para reagendar.

Barbearia Nativa`;

                await service.sendMessage(cliente.telefone, message);
                
                // Atualizar status do agendamento
                agendamento.status = 'cancelado';
                agendamento.cancelado_em = new Date().toISOString();
                agendamento.motivo_cancelamento = reason;
                
                cancelledCount++;
                results.push({
                    agendamento_id: agendamento.id,
                    status: 'cancelado',
                    message: 'Confirmação cancelada com sucesso'
                });

            } catch (error) {
                results.push({
                    agendamento_id: agendamento.id,
                    status: 'erro',
                    message: error.message
                });
            }
        }

        // Salvar agendamentos atualizados
        fs.writeFileSync(agendamentosPath, JSON.stringify(agendamentos, null, 2));

        res.json({
            success: true,
            message: `Confirmações canceladas: ${cancelledCount}/${agendamentosHoje.length}`,
            data: {
                cancelledCount: cancelledCount,
                total: agendamentosHoje.length,
                results: results
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao cancelar confirmações',
            message: error.message
        });
    }
});

// POST /api/whatsapp/send-report-daily - Enviar relatório diário
router.post('/send-report-daily', requireWhatsAppService, async (req, res) => {
    try {
        const service = req.whatsappService;
        
        if (!service.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado',
                message: 'Conecte o WhatsApp antes de enviar relatórios'
            });
        }

        // Buscar agendamentos de hoje
        const today = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo de agendamentos não encontrado'
            });
        }

        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        const agendamentosHoje = agendamentos.filter(apt => apt.data_agendamento === today);

        // Buscar dados dos clientes e serviços
        const clientesPath = path.join(__dirname, '..', 'database', 'clientes.json');
        const servicosPath = path.join(__dirname, '..', 'database', 'servicos.json');
        
        const clientes = fs.existsSync(clientesPath) ? JSON.parse(fs.readFileSync(clientesPath, 'utf8')) : [];
        const servicos = fs.existsSync(servicosPath) ? JSON.parse(fs.readFileSync(servicosPath, 'utf8')) : [];

        // Estatísticas do dia
        const pendentes = agendamentosHoje.filter(apt => apt.status === 'pendente').length;
        const confirmados = agendamentosHoje.filter(apt => apt.status === 'confirmado').length;
        const cancelados = agendamentosHoje.filter(apt => apt.status === 'cancelado').length;
        const total = agendamentosHoje.length;

        // Gerar relatório
        let reportMessage = `📊 RELATÓRIO DIÁRIO - ${new Date().toLocaleDateString('pt-BR')}

📈 RESUMO GERAL:
• Total de agendamentos: ${total}
• Pendentes: ${pendentes}
• Confirmados: ${confirmados}
• Cancelados: ${cancelados}

📋 AGENDAMENTOS DO DIA:`;

        if (agendamentosHoje.length === 0) {
            reportMessage += '\n• Nenhum agendamento para hoje';
        } else {
                    agendamentosHoje.forEach(apt => {
                        const cliente = clientes.find(c => c.id === apt.cliente_id);
                        const servico = servicos.find(s => s.id === apt.servico_id);
                        const statusEmoji = apt.status === 'confirmado' ? '✅' : apt.status === 'cancelado' ? '❌' : '⏳';
                        const horario = apt.horario || apt.horario_agendamento;
                        
                        reportMessage += `\n${statusEmoji} ${horario} - ${cliente ? cliente.nome : 'Cliente não encontrado'} (${servico ? servico.nome : 'Serviço não especificado'})`;
                    });
        }

        reportMessage += '\n\nBarbearia Nativa - Sistema Automático';

        // Enviar relatório para o número do proprietário
        const ownerNumber = '5511998761833'; // Número do proprietário
        await service.sendMessage(ownerNumber, reportMessage);

        res.json({
            success: true,
            message: 'Relatório diário enviado com sucesso',
            data: {
                date: today,
                appointments: {
                    total: total,
                    pending: pendentes,
                    confirmed: confirmados,
                    cancelled: cancelados
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar relatório diário',
            message: error.message
        });
    }
});

// GET /api/whatsapp/logs - Obter logs do sistema
router.get('/logs', (req, res) => {
    try {
        const logsPath = path.join(__dirname, '..', 'database', 'whatsapp_logs.json');
        
        if (!fs.existsSync(logsPath)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao obter logs',
            message: error.message
        });
    }
});

// POST /api/whatsapp/send-report-weekly - Enviar relatório semanal
router.post('/send-report-weekly', requireWhatsAppService, async (req, res) => {
    try {
        const service = req.whatsappService;
        
        if (!service.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado',
                message: 'Conecte o WhatsApp antes de enviar relatórios'
            });
        }

        // Buscar agendamentos da semana atual
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo de agendamentos não encontrado'
            });
        }

        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        const agendamentosSemana = agendamentos.filter(apt => {
            const aptDate = new Date(apt.data_agendamento);
            return aptDate >= startOfWeek && aptDate <= endOfWeek;
        });

        // Estatísticas da semana
        const pendentes = agendamentosSemana.filter(apt => apt.status === 'pendente').length;
        const confirmados = agendamentosSemana.filter(apt => apt.status === 'confirmado').length;
        const cancelados = agendamentosSemana.filter(apt => apt.status === 'cancelado').length;
        const total = agendamentosSemana.length;

        // Gerar relatório semanal
        let reportMessage = `📊 RELATÓRIO SEMANAL - ${startOfWeek.toLocaleDateString('pt-BR')} a ${endOfWeek.toLocaleDateString('pt-BR')}

📈 RESUMO GERAL:
• Total de agendamentos: ${total}
• Pendentes: ${pendentes}
• Confirmados: ${confirmados}
• Cancelados: ${cancelados}

📅 AGENDAMENTOS POR DIA:`;

        // Agrupar por dia
        const agendamentosPorDia = {};
        agendamentosSemana.forEach(apt => {
            const dia = new Date(apt.data_agendamento).toLocaleDateString('pt-BR');
            if (!agendamentosPorDia[dia]) {
                agendamentosPorDia[dia] = [];
            }
            agendamentosPorDia[dia].push(apt);
        });

        Object.keys(agendamentosPorDia).sort().forEach(dia => {
            const apts = agendamentosPorDia[dia];
            reportMessage += `\n\n📅 ${dia} (${apts.length} agendamentos):`;
                    apts.forEach(apt => {
                        const statusEmoji = apt.status === 'confirmado' ? '✅' : apt.status === 'cancelado' ? '❌' : '⏳';
                        const horario = apt.horario || apt.horario_agendamento;
                        reportMessage += `\n${statusEmoji} ${horario} - Status: ${apt.status}`;
                    });
        });

        reportMessage += '\n\nBarbearia Nativa - Sistema Automático';

        // Enviar relatório para o número do proprietário
        const ownerNumber = '5511998761833';
        await service.sendMessage(ownerNumber, reportMessage);

        res.json({
            success: true,
            message: 'Relatório semanal enviado com sucesso',
            data: {
                week: `${startOfWeek.toLocaleDateString('pt-BR')} a ${endOfWeek.toLocaleDateString('pt-BR')}`,
                appointments: {
                    total: total,
                    pending: pendentes,
                    confirmed: confirmados,
                    cancelled: cancelados
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar relatório semanal',
            message: error.message
        });
    }
});

// POST /api/whatsapp/send-report-monthly - Enviar relatório mensal
router.post('/send-report-monthly', requireWhatsAppService, async (req, res) => {
    try {
        const service = req.whatsappService;
        
        if (!service.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado',
                message: 'Conecte o WhatsApp antes de enviar relatórios'
            });
        }

        // Buscar agendamentos do mês atual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({
                success: false,
                error: 'Arquivo de agendamentos não encontrado'
            });
        }

        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        const agendamentosMes = agendamentos.filter(apt => {
            const aptDate = new Date(apt.data_agendamento);
            return aptDate >= startOfMonth && aptDate <= endOfMonth;
        });

        // Estatísticas do mês
        const pendentes = agendamentosMes.filter(apt => apt.status === 'pendente').length;
        const confirmados = agendamentosMes.filter(apt => apt.status === 'confirmado').length;
        const cancelados = agendamentosMes.filter(apt => apt.status === 'cancelado').length;
        const total = agendamentosMes.length;

        // Gerar relatório mensal
        let reportMessage = `📊 RELATÓRIO MENSAL - ${today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}

📈 RESUMO GERAL:
• Total de agendamentos: ${total}
• Pendentes: ${pendentes}
• Confirmados: ${confirmados}
• Cancelados: ${cancelados}

📊 ESTATÍSTICAS:
• Taxa de confirmação: ${total > 0 ? Math.round((confirmados / total) * 100) : 0}%
• Taxa de cancelamento: ${total > 0 ? Math.round((cancelados / total) * 100) : 0}%
• Média de agendamentos por dia: ${total > 0 ? Math.round(total / 30) : 0}`;

        // Top 5 dias com mais agendamentos
        const agendamentosPorDia = {};
        agendamentosMes.forEach(apt => {
            const dia = apt.data_agendamento;
            agendamentosPorDia[dia] = (agendamentosPorDia[dia] || 0) + 1;
        });

        const topDias = Object.entries(agendamentosPorDia)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        if (topDias.length > 0) {
            reportMessage += '\n\n📅 TOP 5 DIAS COM MAIS AGENDAMENTOS:';
            topDias.forEach(([dia, count], index) => {
                reportMessage += `\n${index + 1}. ${new Date(dia).toLocaleDateString('pt-BR')}: ${count} agendamentos`;
            });
        }

        reportMessage += '\n\nBarbearia Nativa - Sistema Automático';

        // Enviar relatório para o número do proprietário
        const ownerNumber = '5511998761833';
        await service.sendMessage(ownerNumber, reportMessage);

        res.json({
            success: true,
            message: 'Relatório mensal enviado com sucesso',
            data: {
                month: today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
                appointments: {
                    total: total,
                    pending: pendentes,
                    confirmed: confirmados,
                    cancelled: cancelados
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar relatório mensal',
            message: error.message
        });
    }
});

// GET /api/whatsapp/today-appointments - Obter agendamentos de hoje
router.get('/today-appointments', (req, res) => {
    try {
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de agendamentos não encontrado' });
        }
        
        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        const today = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
        const agendamentosHoje = agendamentos.filter(apt => apt.data_agendamento === today);
        
        res.json({ success: true, data: agendamentosHoje });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter agendamentos', message: error.message });
    }
});

// GET /api/whatsapp/pending-appointments - Obter agendamentos pendentes de hoje
router.get('/pending-appointments', (req, res) => {
    try {
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de agendamentos não encontrado' });
        }
        
        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        const today = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
        const agendamentosPendentes = agendamentos.filter(apt => 
            apt.data_agendamento === today && 
            (apt.status === 'pendente' || apt.status === 'Agendado')
        );
        
        res.json({ 
            success: true, 
            data: agendamentosPendentes,
            count: agendamentosPendentes.length,
            today: today
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter agendamentos pendentes', message: error.message });
    }
});


// POST /api/whatsapp/clear-logs - Limpar logs
router.post('/clear-logs', (req, res) => {
    try {
        const logsPath = path.join(__dirname, '..', 'database', 'whatsapp_logs.json');
        fs.writeFileSync(logsPath, JSON.stringify([], null, 2));
        
        res.json({
            success: true,
            message: 'Logs limpos com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao limpar logs',
            message: error.message
        });
    }
});

export default router;
