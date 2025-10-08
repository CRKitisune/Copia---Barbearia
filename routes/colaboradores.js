import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Caminho para o arquivo JSON dos colaboradores
const colaboradoresPath = path.join(__dirname, '..', 'database', 'colaboradores.json');

// Função para ler colaboradores do JSON
function readColaboradores() {
    try {
        if (!fs.existsSync(colaboradoresPath)) {
            return [];
        }
        const data = fs.readFileSync(colaboradoresPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler colaboradores:', error);
        return [];
    }
}

// Função para escrever colaboradores no JSON
function writeColaboradores(colaboradores) {
    try {
        fs.writeFileSync(colaboradoresPath, JSON.stringify(colaboradores, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar colaboradores:', error);
        return false;
    }
}

// Função para gerar próximo ID
function getNextId(colaboradores) {
    if (colaboradores.length === 0) return 1;
    return Math.max(...colaboradores.map(c => c.id)) + 1;
}

// GET /api/colaboradores - Listar todos os colaboradores
router.get('/', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        res.json({
            success: true,
            data: colaboradores,
            total: colaboradores.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar colaboradores',
            message: error.message
        });
    }
});

// GET /api/colaboradores/:id - Buscar colaborador por ID
router.get('/:id', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const id = parseInt(req.params.id);
        const colaborador = colaboradores.find(c => c.id === id);

        if (!colaborador) {
            return res.status(404).json({
                success: false,
                error: 'Colaborador não encontrado'
            });
        }

        res.json({
            success: true,
            data: colaborador
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar colaborador',
            message: error.message
        });
    }
});

// POST /api/colaboradores - Criar novo colaborador
router.post('/', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const { nome, cargo, telefone, email, status, especialidades, horario_trabalho, observacoes } = req.body;

        // Validação básica
        if (!nome || !cargo || !telefone || !email) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, cargo, telefone, email'
            });
        }

        // Verificar se email já existe
        const emailExists = colaboradores.some(c => c.email === email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        const novoColaborador = {
            id: getNextId(colaboradores),
            nome,
            cargo,
            telefone,
            email,
            status: status || 'Ativo',
            servicos_semana: 0,
            avaliacao: 0,
            data_cadastro: new Date().toISOString().split('T')[0],
            especialidades: especialidades || [],
            horario_trabalho: horario_trabalho || {
                "segunda": "08:00-18:00",
                "terca": "08:00-18:00",
                "quarta": "08:00-18:00",
                "quinta": "08:00-18:00",
                "sexta": "08:00-18:00",
                "sabado": "08:00-14:00",
                "domingo": "Fechado"
            },
            observacoes: observacoes || ''
        };

        colaboradores.push(novoColaborador);
        
        if (writeColaboradores(colaboradores)) {
            res.status(201).json({
                success: true,
                message: 'Colaborador criado com sucesso! 🎉',
                data: novoColaborador
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar colaborador'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar colaborador',
            message: error.message
        });
    }
});

// PUT /api/colaboradores/:id - Atualizar colaborador
router.put('/:id', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const id = parseInt(req.params.id);
        const colaboradorIndex = colaboradores.findIndex(c => c.id === id);

        if (colaboradorIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Colaborador não encontrado'
            });
        }

        const { nome, cargo, telefone, email, status, especialidades, horario_trabalho, observacoes } = req.body;

        // Validação básica
        if (!nome || !cargo || !telefone || !email) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, cargo, telefone, email'
            });
        }

        // Verificar se email já existe em outro colaborador
        const emailExists = colaboradores.some(c => c.email === email && c.id !== id);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado em outro colaborador'
            });
        }

        // Atualizar colaborador
        colaboradores[colaboradorIndex] = {
            ...colaboradores[colaboradorIndex],
            nome,
            cargo,
            telefone,
            email,
            status: status || colaboradores[colaboradorIndex].status,
            especialidades: especialidades || colaboradores[colaboradorIndex].especialidades,
            horario_trabalho: horario_trabalho || colaboradores[colaboradorIndex].horario_trabalho,
            observacoes: observacoes || colaboradores[colaboradorIndex].observacoes
        };

        if (writeColaboradores(colaboradores)) {
            res.json({
                success: true,
                message: 'Colaborador atualizado com sucesso! ✏️',
                data: colaboradores[colaboradorIndex]
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
            error: 'Erro ao atualizar colaborador',
            message: error.message
        });
    }
});

// DELETE /api/colaboradores/:id - Excluir colaborador
router.delete('/:id', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const id = parseInt(req.params.id);
        const colaboradorIndex = colaboradores.findIndex(c => c.id === id);

        if (colaboradorIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Colaborador não encontrado'
            });
        }

        const colaboradorRemovido = colaboradores[colaboradorIndex];
        colaboradores.splice(colaboradorIndex, 1);

        if (writeColaboradores(colaboradores)) {
            res.json({
                success: true,
                message: 'Colaborador excluído com sucesso! 🗑️',
                data: colaboradorRemovido
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao excluir colaborador'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir colaborador',
            message: error.message
        });
    }
});

// PUT /api/colaboradores/:id/status - Atualizar apenas o status
router.put('/:id/status', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const id = parseInt(req.params.id);
        const { status } = req.body;
        const colaboradorIndex = colaboradores.findIndex(c => c.id === id);

        if (colaboradorIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Colaborador não encontrado'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status é obrigatório'
            });
        }

        colaboradores[colaboradorIndex].status = status;

        if (writeColaboradores(colaboradores)) {
            res.json({
                success: true,
                message: 'Status atualizado com sucesso! 📊',
                data: colaboradores[colaboradorIndex]
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

// GET /api/colaboradores/ativos - Buscar apenas colaboradores ativos
router.get('/ativos', (req, res) => {
    try {
        const colaboradores = readColaboradores();
        const colaboradoresAtivos = colaboradores.filter(c => c.status === 'Ativo');
        
        res.json({
            success: true,
            data: colaboradoresAtivos,
            total: colaboradoresAtivos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar colaboradores ativos',
            message: error.message
        });
    }
});

export default router;
