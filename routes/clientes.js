import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Caminho para o arquivo JSON dos clientes
const clientesPath = path.join(__dirname, '..', 'database', 'clientes.json');

// Função para ler clientes do JSON
function readClientes() {
    try {
        if (!fs.existsSync(clientesPath)) {
            return [];
        }
        const data = fs.readFileSync(clientesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler clientes:', error);
        return [];
    }
}

// Função para escrever clientes no JSON
function writeClientes(clientes) {
    try {
        fs.writeFileSync(clientesPath, JSON.stringify(clientes, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar clientes:', error);
        return false;
    }
}

// Função para gerar próximo ID
function getNextId(clientes) {
    if (clientes.length === 0) return 1;
    return Math.max(...clientes.map(c => c.id)) + 1;
}

// GET /api/clientes - Listar todos os clientes
router.get('/', (req, res) => {
    try {
        const clientes = readClientes();
        res.json({
            success: true,
            data: clientes,
            total: clientes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar clientes',
            message: error.message
        });
    }
});

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', (req, res) => {
    try {
        const clientes = readClientes();
        const id = parseInt(req.params.id);
        const cliente = clientes.find(c => c.id === id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                error: 'Cliente não encontrado'
            });
        }

        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar cliente',
            message: error.message
        });
    }
});

// POST /api/clientes - Criar novo cliente
router.post('/', (req, res) => {
    try {
        const clientes = readClientes();
        const { nome, telefone, email, data_nascimento, observacoes, preferencias } = req.body;

        // Validação básica
        if (!nome || !telefone || !email) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, telefone, email'
            });
        }

        // Verificar se email já existe
        const emailExists = clientes.some(c => c.email === email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        // Verificar se telefone já existe
        const telefoneExists = clientes.some(c => c.telefone === telefone);
        if (telefoneExists) {
            return res.status(400).json({
                success: false,
                error: 'Telefone já cadastrado'
            });
        }

        const novoCliente = {
            id: getNextId(clientes),
            nome,
            telefone,
            email,
            data_nascimento: data_nascimento || null,
            data_cadastro: new Date().toISOString().split('T')[0],
            status: 'Ativo',
            observacoes: observacoes || '',
            preferencias: preferencias || {
                barbeiro_preferido: null,
                servico_preferido: null,
                horario_preferido: null
            },
            historico_agendamentos: 0,
            ultima_visita: null
        };

        clientes.push(novoCliente);
        
        if (writeClientes(clientes)) {
            res.status(201).json({
                success: true,
                message: 'Cliente criado com sucesso! 🎉',
                data: novoCliente
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar cliente'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar cliente',
            message: error.message
        });
    }
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', (req, res) => {
    try {
        const clientes = readClientes();
        const id = parseInt(req.params.id);
        const clienteIndex = clientes.findIndex(c => c.id === id);

        if (clienteIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cliente não encontrado'
            });
        }

        const { nome, telefone, email, data_nascimento, status, observacoes, preferencias } = req.body;

        // Validação básica
        if (!nome || !telefone || !email) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, telefone, email'
            });
        }

        // Verificar se email já existe em outro cliente
        const emailExists = clientes.some(c => c.email === email && c.id !== id);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado em outro cliente'
            });
        }

        // Verificar se telefone já existe em outro cliente
        const telefoneExists = clientes.some(c => c.telefone === telefone && c.id !== id);
        if (telefoneExists) {
            return res.status(400).json({
                success: false,
                error: 'Telefone já cadastrado em outro cliente'
            });
        }

        // Atualizar cliente
        clientes[clienteIndex] = {
            ...clientes[clienteIndex],
            nome,
            telefone,
            email,
            data_nascimento: data_nascimento || clientes[clienteIndex].data_nascimento,
            status: status || clientes[clienteIndex].status,
            observacoes: observacoes || clientes[clienteIndex].observacoes,
            preferencias: preferencias || clientes[clienteIndex].preferencias
        };

        if (writeClientes(clientes)) {
            res.json({
                success: true,
                message: 'Cliente atualizado com sucesso! ✏️',
                data: clientes[clienteIndex]
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
            error: 'Erro ao atualizar cliente',
            message: error.message
        });
    }
});

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', (req, res) => {
    try {
        const clientes = readClientes();
        const id = parseInt(req.params.id);
        const clienteIndex = clientes.findIndex(c => c.id === id);

        if (clienteIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Cliente não encontrado'
            });
        }

        const clienteRemovido = clientes[clienteIndex];
        clientes.splice(clienteIndex, 1);

        if (writeClientes(clientes)) {
            res.json({
                success: true,
                message: 'Cliente excluído com sucesso! 🗑️',
                data: clienteRemovido
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao excluir cliente'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir cliente',
            message: error.message
        });
    }
});

// GET /api/clientes/ativos - Buscar apenas clientes ativos
router.get('/ativos', (req, res) => {
    try {
        const clientes = readClientes();
        const clientesAtivos = clientes.filter(c => c.status === 'Ativo');
        
        res.json({
            success: true,
            data: clientesAtivos,
            total: clientesAtivos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar clientes ativos',
            message: error.message
        });
    }
});

// GET /api/clientes/buscar/:termo - Buscar clientes por nome, telefone ou email
router.get('/buscar/:termo', (req, res) => {
    try {
        const clientes = readClientes();
        const termo = req.params.termo.toLowerCase();
        
        const clientesEncontrados = clientes.filter(c => 
            c.nome.toLowerCase().includes(termo) ||
            c.telefone.includes(termo) ||
            c.email.toLowerCase().includes(termo)
        );
        
        res.json({
            success: true,
            data: clientesEncontrados,
            total: clientesEncontrados.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar clientes',
            message: error.message
        });
    }
});

export default router;

