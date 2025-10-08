import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// GET /api/frontend/services - Obter todos os serviços para o frontend
router.get('/services', (req, res) => {
    try {
        const servicosPath = path.join(__dirname, '..', 'database', 'servicos.json');
        if (!fs.existsSync(servicosPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de serviços não encontrado' });
        }
        
        const servicos = JSON.parse(fs.readFileSync(servicosPath, 'utf8'));
        res.json({ success: true, data: servicos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter serviços', message: error.message });
    }
});

// GET /api/frontend/appointments - Obter todos os agendamentos para o frontend
router.get('/appointments', (req, res) => {
    try {
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de agendamentos não encontrado' });
        }
        
        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        res.json({ success: true, data: agendamentos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter agendamentos', message: error.message });
    }
});

// GET /api/frontend/employees - Obter todos os colaboradores para o frontend
router.get('/employees', (req, res) => {
    try {
        const colaboradoresPath = path.join(__dirname, '..', 'database', 'colaboradores.json');
        if (!fs.existsSync(colaboradoresPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de colaboradores não encontrado' });
        }
        
        const colaboradores = JSON.parse(fs.readFileSync(colaboradoresPath, 'utf8'));
        res.json({ success: true, data: colaboradores });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter colaboradores', message: error.message });
    }
});

// GET /api/frontend/clients - Obter todos os clientes para o frontend
router.get('/clients', (req, res) => {
    try {
        const clientesPath = path.join(__dirname, '..', 'database', 'clientes.json');
        if (!fs.existsSync(clientesPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de clientes não encontrado' });
        }
        
        const clientes = JSON.parse(fs.readFileSync(clientesPath, 'utf8'));
        res.json({ success: true, data: clientes });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao obter clientes', message: error.message });
    }
});

// POST /api/frontend/appointments - Criar novo agendamento via frontend
router.post('/appointments', (req, res) => {
    try {
        const agendamentosPath = path.join(__dirname, '..', 'database', 'agendamentos.json');
        if (!fs.existsSync(agendamentosPath)) {
            return res.status(404).json({ success: false, error: 'Arquivo de agendamentos não encontrado' });
        }
        
        const agendamentos = JSON.parse(fs.readFileSync(agendamentosPath, 'utf8'));
        
        // Gerar novo ID
        const newId = Math.max(...agendamentos.map(a => a.id || 0)) + 1;
        
        // Criar novo agendamento
        const novoAgendamento = {
            id: newId,
            ...req.body,
            data_criacao: new Date().toISOString(),
            status: 'pendente'
        };
        
        agendamentos.push(novoAgendamento);
        
        // Salvar no arquivo
        fs.writeFileSync(agendamentosPath, JSON.stringify(agendamentos, null, 2));
        
        res.json({ success: true, data: novoAgendamento, message: 'Agendamento criado com sucesso' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar agendamento', message: error.message });
    }
});

export default router;
