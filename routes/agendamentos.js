import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NotificationService from '../services/notification.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Instância do serviço de notificações
const notificationService = new NotificationService();

// Caminho para o arquivo JSON dos agendamentos
const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');

// Função para ler agendamentos do JSON
function readAgendamentos() {
    try {
        if (!fs.existsSync(agendamentosPath)) {
            return [];
        }
        const data = fs.readFileSync(agendamentosPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler agendamentos:', error);
        return [];
    }
}

// Função para escrever agendamentos no JSON
function writeAgendamentos(agendamentos) {
    try {
        fs.writeFileSync(agendamentosPath, JSON.stringify(agendamentos, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar agendamentos:', error);
        return false;
    }
}

// Função para gerar próximo ID
function getNextId(agendamentos) {
    if (agendamentos.length === 0) return 1;
    return Math.max(...agendamentos.map(a => a.id)) + 1;
}

// GET /api/agendamentos - Listar todos os agendamentos
router.get('/', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        res.json({
            success: true,
            data: agendamentos,
            total: agendamentos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar agendamentos',
            message: error.message
        });
    }
});

// GET /api/agendamentos/:id - Buscar agendamento por ID
router.get('/:id', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const id = parseInt(req.params.id);
        const agendamento = agendamentos.find(a => a.id === id);

        if (!agendamento) {
            return res.status(404).json({
                success: false,
                error: 'Agendamento não encontrado'
            });
        }

        res.json({
            success: true,
            data: agendamento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar agendamento',
            message: error.message
        });
    }
});

// POST /api/agendamentos - Criar novo agendamento
router.post('/', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const { 
            cliente_id, cliente_nome, cliente_telefone,
            servico_id, servico_nome, servico_preco,
            colaborador_id, colaborador_nome,
            data_agendamento, horario_agendamento,
            observacoes, duracao_estimada, forma_pagamento
        } = req.body;

        // Validação básica
        if (!cliente_nome || !servico_nome || !colaborador_nome || !data_agendamento || !horario_agendamento) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: cliente_nome, servico_nome, colaborador_nome, data_agendamento, horario_agendamento'
            });
        }

        // Verificar conflito de horário
        const conflito = agendamentos.find(a => 
            a.colaborador_id === colaborador_id &&
            a.data_agendamento === data_agendamento &&
            a.horario_agendamento === horario_agendamento &&
            a.status !== 'Cancelado'
        );

        if (conflito) {
            return res.status(400).json({
                success: false,
                error: 'Horário já ocupado para este colaborador'
            });
        }

        const novoAgendamento = {
            id: getNextId(agendamentos),
            cliente_id: cliente_id || null,
            cliente_nome,
            cliente_telefone: cliente_telefone || '',
            servico_id: servico_id || null,
            servico_nome,
            servico_preco: parseFloat(servico_preco) || 0,
            colaborador_id: colaborador_id || null,
            colaborador_nome,
            data_agendamento,
            horario_agendamento,
            status: 'Agendado',
            observacoes: observacoes || '',
            data_criacao: new Date().toISOString(),
            duracao_estimada: parseInt(duracao_estimada) || 60,
            forma_pagamento: forma_pagamento || 'Dinheiro'
        };

        agendamentos.push(novoAgendamento);
        
        if (writeAgendamentos(agendamentos)) {
            // Enviar notificação de confirmação
            notificationService.processNewAppointment(novoAgendamento).catch(error => {
                console.error('Erro ao enviar notificação:', error);
            });
            
            res.status(201).json({
                success: true,
                message: 'Agendamento criado com sucesso! 🎉',
                data: novoAgendamento
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar agendamento'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar agendamento',
            message: error.message
        });
    }
});

// PUT /api/agendamentos/:id - Atualizar agendamento
router.put('/:id', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const id = parseInt(req.params.id);
        const agendamentoIndex = agendamentos.findIndex(a => a.id === id);

        if (agendamentoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Agendamento não encontrado'
            });
        }

        const { 
            cliente_nome, cliente_telefone,
            servico_nome, servico_preco,
            colaborador_nome, colaborador_id,
            data_agendamento, horario_agendamento,
            status, observacoes, forma_pagamento
        } = req.body;

        // Validação básica
        if (!cliente_nome || !servico_nome || !colaborador_nome || !data_agendamento || !horario_agendamento) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: cliente_nome, servico_nome, colaborador_nome, data_agendamento, horario_agendamento'
            });
        }

        // Verificar conflito de horário (exceto para o próprio agendamento)
        const conflito = agendamentos.find(a => 
            a.id !== id &&
            a.colaborador_id === colaborador_id &&
            a.data_agendamento === data_agendamento &&
            a.horario_agendamento === horario_agendamento &&
            a.status !== 'Cancelado'
        );

        if (conflito) {
            return res.status(400).json({
                success: false,
                error: 'Horário já ocupado para este colaborador'
            });
        }

        // Salvar status antigo para notificação
        const oldStatus = agendamentos[agendamentoIndex].status;

        // Atualizar agendamento
        agendamentos[agendamentoIndex] = {
            ...agendamentos[agendamentoIndex],
            cliente_nome,
            cliente_telefone: cliente_telefone || agendamentos[agendamentoIndex].cliente_telefone,
            servico_nome,
            servico_preco: parseFloat(servico_preco) || agendamentos[agendamentoIndex].servico_preco,
            colaborador_nome,
            colaborador_id: colaborador_id || agendamentos[agendamentoIndex].colaborador_id,
            data_agendamento,
            horario_agendamento,
            status: status || agendamentos[agendamentoIndex].status,
            observacoes: observacoes || agendamentos[agendamentoIndex].observacoes,
            forma_pagamento: forma_pagamento || agendamentos[agendamentoIndex].forma_pagamento
        };

        if (writeAgendamentos(agendamentos)) {
            // Enviar notificação se status mudou
            if (status && status !== oldStatus) {
                notificationService.processUpdatedAppointment(agendamentos[agendamentoIndex], oldStatus).catch(error => {
                    console.error('Erro ao enviar notificação de atualização:', error);
                });
            }
            
            res.json({
                success: true,
                message: 'Agendamento atualizado com sucesso! ✏️',
                data: agendamentos[agendamentoIndex]
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar alterações'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar agendamento',
            message: error.message
        });
    }
});

// PUT /api/agendamentos/:id/status - Atualizar status do agendamento
router.put('/:id/status', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const id = parseInt(req.params.id);
        const { status, motivo_cancelamento } = req.body;
        const agendamentoIndex = agendamentos.findIndex(a => a.id === id);

        if (agendamentoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Agendamento não encontrado'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status é obrigatório'
            });
        }

        // Atualizar status
        agendamentos[agendamentoIndex].status = status;

        // Adicionar data de conclusão se for concluído
        if (status === 'Concluído') {
            agendamentos[agendamentoIndex].data_conclusao = new Date().toISOString();
        }

        // Adicionar data de cancelamento se for cancelado
        if (status === 'Cancelado') {
            agendamentos[agendamentoIndex].data_cancelamento = new Date().toISOString();
            agendamentos[agendamentoIndex].motivo_cancelamento = motivo_cancelamento || 'Cancelado pelo cliente';
        }

        if (writeAgendamentos(agendamentos)) {
            res.json({
                success: true,
                message: 'Status atualizado com sucesso! 📊',
                data: agendamentos[agendamentoIndex]
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar status'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar status',
            message: error.message
        });
    }
});

// DELETE /api/agendamentos/:id - Excluir agendamento
router.delete('/:id', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const id = parseInt(req.params.id);
        const agendamentoIndex = agendamentos.findIndex(a => a.id === id);

        if (agendamentoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Agendamento não encontrado'
            });
        }

        const agendamentoRemovido = agendamentos[agendamentoIndex];
        agendamentos.splice(agendamentoIndex, 1);

        if (writeAgendamentos(agendamentos)) {
            res.json({
                success: true,
                message: 'Agendamento excluído com sucesso! 🗑️',
                data: agendamentoRemovido
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao excluir agendamento'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir agendamento',
            message: error.message
        });
    }
});

// GET /api/agendamentos/status/:status - Buscar agendamentos por status
router.get('/status/:status', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const status = req.params.status;
        const agendamentosStatus = agendamentos.filter(a => a.status === status);
        
        res.json({
            success: true,
            data: agendamentosStatus,
            total: agendamentosStatus.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar agendamentos por status',
            message: error.message
        });
    }
});

// GET /api/agendamentos/colaborador/:id - Buscar agendamentos por colaborador
router.get('/colaborador/:id', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const colaboradorId = parseInt(req.params.id);
        const agendamentosColaborador = agendamentos.filter(a => a.colaborador_id === colaboradorId);
        
        res.json({
            success: true,
            data: agendamentosColaborador,
            total: agendamentosColaborador.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar agendamentos do colaborador',
            message: error.message
        });
    }
});

// GET /api/agendamentos/data/:data - Buscar agendamentos por data
router.get('/data/:data', (req, res) => {
    try {
        const agendamentos = readAgendamentos();
        const data = req.params.data;
        const agendamentosData = agendamentos.filter(a => a.data_agendamento === data);
        
        res.json({
            success: true,
            data: agendamentosData,
            total: agendamentosData.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar agendamentos por data',
            message: error.message
        });
    }
});

export default router;

