import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Importar rotas
import colaboradoresRoutes from './routes/colaboradores.js';
import servicosRoutes from './routes/servicos.js';
import clientesRoutes from './routes/clientes.js';
import agendamentosRoutes from './routes/agendamentos.js';
import avaliacoesRoutes from './routes/avaliacoes.js';
import whatsappRoutes from './routes/whatsapp.js';
import frontendRoutes from './routes/frontend.js';

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));

// Rotas da API
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/frontend', frontendRoutes); 

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sources', 'index.html'));
});

// Rota para redirecionar colaborador.html para o caminho correto
app.get('/colaborador.html', (req, res) => {
    res.redirect('/sources/colaborador.html');
});

// Rota para o painel de administração do WhatsApp
app.get('/whatsapp-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'sources', 'whatsapp-admin.html'));
});

// Rota para verificar agendamentos (para debug) - MANTIDA PARA COMPATIBILIDADE
app.get('/api/agendamentos-debug', (req, res) => {
    res.json({ 
        message: 'Os agendamentos são armazenados no localStorage do navegador.',
        instrucoes: [
            '1. Abra o Console do navegador (F12)',
            '2. Digite: localStorage.getItem("barbearia_appointments")',
            '3. Isso mostrará todos os agendamentos salvos'
        ],
        nota: 'Use /api/agendamentos para acessar os agendamentos do banco de dados'
    });
});

// Rota de status da API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: '🚀 API da Barbearia Nativa funcionando perfeitamente!',
        version: '1.0.0',
        endpoints: {
            colaboradores: '/api/colaboradores',
            servicos: '/api/servicos',
            clientes: '/api/clientes',
            agendamentos: '/api/agendamentos',
            avaliacoes: '/api/avaliacoes',
            whatsapp: '/api/whatsapp'
        },
        timestamp: new Date().toISOString()
    });
});


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado! 😅',
        message: err.message 
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada! 🤷‍♂️',
        path: req.originalUrl 
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Frontend Local: http://localhost:${PORT}`);
    console.log(`📱 Frontend (Rede): http://192.168.0.100:${PORT}`);
    console.log(`🔧 API Local: http://localhost:${PORT}/api`);
    console.log(`🔧 API (Rede): http://192.168.0.100:${PORT}/api`);
    console.log(`👥 Colaboradores: http://192.168.0.100:${PORT}/sources/colaborador.html`);
});
