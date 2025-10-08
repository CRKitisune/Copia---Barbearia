import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Caminho para o arquivo JSON dos serviços
const servicosPath = path.join(__dirname, '..', 'database', 'servicos.json');

// Função para ler serviços do JSON
function readServicos() {
    try {
        if (!fs.existsSync(servicosPath)) {
            return [];
        }
        const data = fs.readFileSync(servicosPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler serviços:', error);
        return [];
    }
}

// Função para escrever serviços no JSON
function writeServicos(servicos) {
    try {
        fs.writeFileSync(servicosPath, JSON.stringify(servicos, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar serviços:', error);
        return false;
    }
}

// Função para gerar próximo ID
function getNextId(servicos) {
    if (servicos.length === 0) return 1;
    return Math.max(...servicos.map(s => s.id)) + 1;
}

// GET /api/servicos - Listar todos os serviços
router.get('/', (req, res) => {
    try {
        const servicos = readServicos();
        res.json({
            success: true,
            data: servicos,
            total: servicos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar serviços',
            message: error.message
        });
    }
});

// GET /api/servicos/:id - Buscar serviço por ID
router.get('/:id', (req, res) => {
    try {
        const servicos = readServicos();
        const id = parseInt(req.params.id);
        const servico = servicos.find(s => s.id === id);

        if (!servico) {
            return res.status(404).json({
                success: false,
                error: 'Serviço não encontrado'
            });
        }

        res.json({
            success: true,
            data: servico
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar serviço',
            message: error.message
        });
    }
});

// POST /api/servicos - Criar novo serviço
router.post('/', (req, res) => {
    try {
        const servicos = readServicos();
        const { nome, descricao, preco, duracao, categoria, especialidades_necessarias, observacoes } = req.body;

        // Validação básica
        if (!nome || !preco || !duracao) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, preco, duracao'
            });
        }

        // Verificar se nome já existe
        const nomeExists = servicos.some(s => s.nome === nome);
        if (nomeExists) {
            return res.status(400).json({
                success: false,
                error: 'Nome do serviço já cadastrado'
            });
        }

        const novoServico = {
            id: getNextId(servicos),
            nome,
            descricao: descricao || '',
            preco: parseFloat(preco),
            duracao: parseInt(duracao),
            categoria: categoria || 'Geral',
            ativo: true,
            especialidades_necessarias: especialidades_necessarias || [],
            observacoes: observacoes || ''
        };

        servicos.push(novoServico);
        
        if (writeServicos(servicos)) {
            res.status(201).json({
                success: true,
                message: 'Serviço criado com sucesso! 🎉',
                data: novoServico
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar serviço'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar serviço',
            message: error.message
        });
    }
});

// PUT /api/servicos/:id - Atualizar serviço
router.put('/:id', (req, res) => {
    try {
        const servicos = readServicos();
        const id = parseInt(req.params.id);
        const servicoIndex = servicos.findIndex(s => s.id === id);

        if (servicoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Serviço não encontrado'
            });
        }

        const { nome, descricao, preco, duracao, categoria, ativo, especialidades_necessarias, observacoes } = req.body;

        // Validação básica
        if (!nome || !preco || !duracao) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: nome, preco, duracao'
            });
        }

        // Verificar se nome já existe em outro serviço
        const nomeExists = servicos.some(s => s.nome === nome && s.id !== id);
        if (nomeExists) {
            return res.status(400).json({
                success: false,
                error: 'Nome do serviço já cadastrado em outro serviço'
            });
        }

        // Atualizar serviço
        servicos[servicoIndex] = {
            ...servicos[servicoIndex],
            nome,
            descricao: descricao || servicos[servicoIndex].descricao,
            preco: parseFloat(preco),
            duracao: parseInt(duracao),
            categoria: categoria || servicos[servicoIndex].categoria,
            ativo: ativo !== undefined ? ativo : servicos[servicoIndex].ativo,
            especialidades_necessarias: especialidades_necessarias || servicos[servicoIndex].especialidades_necessarias,
            observacoes: observacoes || servicos[servicoIndex].observacoes
        };

        if (writeServicos(servicos)) {
            res.json({
                success: true,
                message: 'Serviço atualizado com sucesso! ✏️',
                data: servicos[servicoIndex]
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
            error: 'Erro ao atualizar serviço',
            message: error.message
        });
    }
});

// DELETE /api/servicos/:id - Excluir serviço
router.delete('/:id', (req, res) => {
    try {
        const servicos = readServicos();
        const id = parseInt(req.params.id);
        const servicoIndex = servicos.findIndex(s => s.id === id);

        if (servicoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Serviço não encontrado'
            });
        }

        const servicoRemovido = servicos[servicoIndex];
        servicos.splice(servicoIndex, 1);

        if (writeServicos(servicos)) {
            res.json({
                success: true,
                message: 'Serviço excluído com sucesso! 🗑️',
                data: servicoRemovido
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao excluir serviço'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir serviço',
            message: error.message
        });
    }
});

// GET /api/servicos/ativos - Buscar apenas serviços ativos
router.get('/ativos', (req, res) => {
    try {
        const servicos = readServicos();
        const servicosAtivos = servicos.filter(s => s.ativo === true);
        
        res.json({
            success: true,
            data: servicosAtivos,
            total: servicosAtivos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar serviços ativos',
            message: error.message
        });
    }
});

// GET /api/servicos/categoria/:categoria - Buscar serviços por categoria
router.get('/categoria/:categoria', (req, res) => {
    try {
        const servicos = readServicos();
        const categoria = req.params.categoria;
        const servicosCategoria = servicos.filter(s => 
            s.categoria.toLowerCase() === categoria.toLowerCase() && s.ativo === true
        );
        
        res.json({
            success: true,
            data: servicosCategoria,
            total: servicosCategoria.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar serviços por categoria',
            message: error.message
        });
    }
});

export default router;

