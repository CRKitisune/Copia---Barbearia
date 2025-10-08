import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Caminho para o arquivo JSON das avaliações
const avaliacoesPath = path.join(__dirname, '..', 'database', 'avaliacoes.json');

// Função para ler avaliações do JSON
function readAvaliacoes() {
    try {
        if (!fs.existsSync(avaliacoesPath)) {
            return [];
        }
        const data = fs.readFileSync(avaliacoesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler avaliações:', error);
        return [];
    }
}

// Função para escrever avaliações no JSON
function writeAvaliacoes(avaliacoes) {
    try {
        fs.writeFileSync(avaliacoesPath, JSON.stringify(avaliacoes, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar avaliações:', error);
        return false;
    }
}

// Função para gerar próximo ID
function getNextId(avaliacoes) {
    if (avaliacoes.length === 0) return 1;
    return Math.max(...avaliacoes.map(a => a.id)) + 1;
}

// GET /api/avaliacoes - Listar todas as avaliações
router.get('/', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        res.json({
            success: true,
            data: avaliacoes,
            total: avaliacoes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar avaliações',
            message: error.message
        });
    }
});

// GET /api/avaliacoes/:id - Buscar avaliação por ID
router.get('/:id', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const id = parseInt(req.params.id);
        const avaliacao = avaliacoes.find(a => a.id === id);

        if (!avaliacao) {
            return res.status(404).json({
                success: false,
                error: 'Avaliação não encontrada'
            });
        }

        res.json({
            success: true,
            data: avaliacao
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar avaliação',
            message: error.message
        });
    }
});

// POST /api/avaliacoes - Criar nova avaliação
router.post('/', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const { 
            cliente_id, cliente_nome,
            colaborador_id, colaborador_nome,
            agendamento_id, nota, comentario, criterios
        } = req.body;

        // Validação básica
        if (!cliente_nome || !colaborador_nome || !nota) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: cliente_nome, colaborador_nome, nota'
            });
        }

        // Verificar se nota está no range válido
        if (nota < 1 || nota > 5) {
            return res.status(400).json({
                success: false,
                error: 'Nota deve estar entre 1 e 5'
            });
        }

        // Verificar se já existe avaliação para este agendamento
        if (agendamento_id) {
            const avaliacaoExistente = avaliacoes.find(a => a.agendamento_id === agendamento_id);
            if (avaliacaoExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Já existe uma avaliação para este agendamento'
                });
            }
        }

        const novaAvaliacao = {
            id: getNextId(avaliacoes),
            cliente_id: cliente_id || null,
            cliente_nome,
            colaborador_id: colaborador_id || null,
            colaborador_nome,
            agendamento_id: agendamento_id || null,
            nota: parseInt(nota),
            comentario: comentario || '',
            data_avaliacao: new Date().toISOString(),
            criterios: criterios || {
                qualidade_servico: nota,
                atendimento: nota,
                ambiente: nota,
                pontualidade: nota
            },
            status: 'Publicada'
        };

        avaliacoes.push(novaAvaliacao);
        
        if (writeAvaliacoes(avaliacoes)) {
            res.status(201).json({
                success: true,
                message: 'Avaliação criada com sucesso! 🎉',
                data: novaAvaliacao
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao salvar avaliação'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao criar avaliação',
            message: error.message
        });
    }
});

// PUT /api/avaliacoes/:id - Atualizar avaliação
router.put('/:id', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const id = parseInt(req.params.id);
        const avaliacaoIndex = avaliacoes.findIndex(a => a.id === id);

        if (avaliacaoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Avaliação não encontrada'
            });
        }

        const { nota, comentario, criterios, status } = req.body;

        // Validação básica
        if (nota && (nota < 1 || nota > 5)) {
            return res.status(400).json({
                success: false,
                error: 'Nota deve estar entre 1 e 5'
            });
        }

        // Atualizar avaliação
        avaliacoes[avaliacaoIndex] = {
            ...avaliacoes[avaliacaoIndex],
            nota: nota ? parseInt(nota) : avaliacoes[avaliacaoIndex].nota,
            comentario: comentario || avaliacoes[avaliacaoIndex].comentario,
            criterios: criterios || avaliacoes[avaliacaoIndex].criterios,
            status: status || avaliacoes[avaliacaoIndex].status
        };

        if (writeAvaliacoes(avaliacoes)) {
            res.json({
                success: true,
                message: 'Avaliação atualizada com sucesso! ✏️',
                data: avaliacoes[avaliacaoIndex]
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
            error: 'Erro ao atualizar avaliação',
            message: error.message
        });
    }
});

// DELETE /api/avaliacoes/:id - Excluir avaliação
router.delete('/:id', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const id = parseInt(req.params.id);
        const avaliacaoIndex = avaliacoes.findIndex(a => a.id === id);

        if (avaliacaoIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Avaliação não encontrada'
            });
        }

        const avaliacaoRemovida = avaliacoes[avaliacaoIndex];
        avaliacoes.splice(avaliacaoIndex, 1);

        if (writeAvaliacoes(avaliacoes)) {
            res.json({
                success: true,
                message: 'Avaliação excluída com sucesso! 🗑️',
                data: avaliacaoRemovida
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao excluir avaliação'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir avaliação',
            message: error.message
        });
    }
});

// GET /api/avaliacoes/colaborador/:id - Buscar avaliações por colaborador
router.get('/colaborador/:id', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const colaboradorId = parseInt(req.params.id);
        const avaliacoesColaborador = avaliacoes.filter(a => a.colaborador_id === colaboradorId);
        
        // Calcular média das avaliações
        const media = avaliacoesColaborador.length > 0 
            ? avaliacoesColaborador.reduce((sum, a) => sum + a.nota, 0) / avaliacoesColaborador.length 
            : 0;
        
        res.json({
            success: true,
            data: avaliacoesColaborador,
            total: avaliacoesColaborador.length,
            media: Math.round(media * 10) / 10
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar avaliações do colaborador',
            message: error.message
        });
    }
});

// GET /api/avaliacoes/cliente/:id - Buscar avaliações por cliente
router.get('/cliente/:id', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const clienteId = parseInt(req.params.id);
        const avaliacoesCliente = avaliacoes.filter(a => a.cliente_id === clienteId);
        
        res.json({
            success: true,
            data: avaliacoesCliente,
            total: avaliacoesCliente.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar avaliações do cliente',
            message: error.message
        });
    }
});

// GET /api/avaliacoes/status/:status - Buscar avaliações por status
router.get('/status/:status', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        const status = req.params.status;
        const avaliacoesStatus = avaliacoes.filter(a => a.status === status);
        
        res.json({
            success: true,
            data: avaliacoesStatus,
            total: avaliacoesStatus.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar avaliações por status',
            message: error.message
        });
    }
});

// GET /api/avaliacoes/estatisticas/geral - Estatísticas gerais das avaliações
router.get('/estatisticas/geral', (req, res) => {
    try {
        const avaliacoes = readAvaliacoes();
        
        if (avaliacoes.length === 0) {
            return res.json({
                success: true,
                data: {
                    total: 0,
                    media: 0,
                    distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    publicadas: 0,
                    pendentes: 0
                }
            });
        }

        const media = avaliacoes.reduce((sum, a) => sum + a.nota, 0) / avaliacoes.length;
        const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        avaliacoes.forEach(a => {
            distribuicao[a.nota]++;
        });

        const publicadas = avaliacoes.filter(a => a.status === 'Publicada').length;
        const pendentes = avaliacoes.filter(a => a.status === 'Pendente').length;

        res.json({
            success: true,
            data: {
                total: avaliacoes.length,
                media: Math.round(media * 10) / 10,
                distribuicao,
                publicadas,
                pendentes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar estatísticas das avaliações',
            message: error.message
        });
    }
});

export default router;

