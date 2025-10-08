# 🚀 Sistema de Barbearia - WhatsApp Integration

Sistema completo de gestão de barbearia com integração WhatsApp para agendamentos automáticos, notificações e relatórios.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Banco de Dados](#-banco-de-dados)
- [WhatsApp Integration](#-whatsapp-integration)
- [Troubleshooting](#-troubleshooting)

## ✨ Funcionalidades

### 🎯 Sistema Principal
- **Agendamento Online**: Clientes podem agendar serviços via site
- **Painel Administrativo**: Gestão completa de agendamentos, clientes e colaboradores
- **Sistema de Avaliações**: Clientes podem avaliar serviços prestados
- **Relatórios Financeiros**: Dashboard com métricas de receita e serviços

### 📱 WhatsApp Integration
- **Autenticação Persistente**: Login automático mantido entre sessões
- **Confirmações Automáticas**: Envio de mensagens de confirmação de agendamentos
- **Cancelamentos em Massa**: Cancelar todos os agendamentos de um dia
- **Relatórios Automáticos**: Envio diário, semanal e mensal para o proprietário
- **QR Code Interface**: Interface web para login no WhatsApp
- **Logs Completos**: Histórico de todas as mensagens enviadas

### 👥 Gestão de Usuários
- **Clientes**: Cadastro automático via agendamentos
- **Colaboradores**: Gestão de funcionários e serviços
- **Admin**: Painel administrativo completo

## 🛠 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Baileys** - Biblioteca WhatsApp Web API
- **node-cron** - Agendamento de tarefas
- **fs/path** - Sistema de arquivos

### Frontend
- **HTML5/CSS3** - Interface responsiva
- **JavaScript ES6+** - Lógica do cliente
- **Bootstrap 5.3.0** - Framework CSS
- **Font Awesome 6.4.0** - Ícones

### Banco de Dados
- **JSON Files** - Armazenamento de dados
- **Sistema de Arquivos** - Persistência local

## 📁 Estrutura do Projeto

```
SITE_MAIN_DEX-main/
├── 📄 server.js                 # Servidor principal
├── 📄 package.json              # Dependências
├── 📁 database/                 # Banco de dados JSON
│   ├── 📄 agendamentos.json     # Agendamentos
│   ├── 📄 clientes.json         # Clientes
│   ├── 📄 colaboradores.json    # Funcionários
│   ├── 📄 servicos.json         # Serviços
│   ├── 📄 avaliacoes.json       # Avaliações
│   ├── 📄 message_templates.json # Templates WhatsApp
│   └── 📄 whatsapp_logs.json    # Logs WhatsApp
├── 📁 routes/                   # Rotas da API
│   ├── 📄 frontend.js           # API Frontend
│   ├── 📄 whatsapp.js           # API WhatsApp
│   ├── 📄 agendamentos.js       # CRUD Agendamentos
│   ├── 📄 servicos.js           # CRUD Serviços
│   ├── 📄 colaboradores.js      # CRUD Colaboradores
│   ├── 📄 clientes.js           # CRUD Clientes
│   └── 📄 avaliacoes.js         # CRUD Avaliações
├── 📁 services/                 # Serviços
│   ├── 📄 whatsapp.service.js   # Serviço WhatsApp
│   └── 📄 whatsapp-admin.service.js # Admin WhatsApp
├── 📁 sources/                  # Frontend
│   ├── 📄 index.html            # Site público
│   ├── 📄 colaborador.html      # Painel admin
│   └── 📄 whatsapp-admin.html   # Admin WhatsApp
└── 📁 auth_info_baileys/        # Sessões WhatsApp
```

## 🚀 Instalação

### Pré-requisitos
- **Node.js** (versão 14 ou superior)
- **NPM** ou **Yarn**
- **Git**

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd SITE_MAIN_DEX-main
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor**
```bash
npm start
# ou
node server.js
```

4. **Acesse o sistema**
- **Site público**: http://localhost:8080
- **Painel admin**: http://localhost:8080/colaborador
- **Admin WhatsApp**: http://localhost:8080/whatsapp-admin

## ⚙️ Configuração

### Configuração WhatsApp
1. Acesse http://localhost:8080/whatsapp-admin
2. Clique em "Conectar WhatsApp"
3. Escaneie o QR Code com seu celular
4. Aguarde a confirmação de conexão

### Configuração de Serviços
1. Acesse o painel admin
2. Vá para "Gestão de Serviços"
3. Adicione os serviços disponíveis
4. Configure preços e durações

### Configuração de Colaboradores
1. No painel admin, vá para "Colaboradores"
2. Adicione funcionários
3. Configure horários e especialidades

## 📖 Uso

### Para Clientes (Site Público)
1. Acesse http://localhost:8080
2. Escolha o serviço desejado
3. Selecione data e horário
4. Preencha dados pessoais
5. Confirme o agendamento

### Para Administradores
1. **Login**: Acesse /colaborador e faça login
2. **Visualizar Agendamentos**: Veja todos os agendamentos pendentes
3. **Finalizar Serviços**: Marque serviços como concluídos
4. **Gestão**: Gerencie clientes, colaboradores e serviços
5. **Relatórios**: Visualize dados financeiros e estatísticas

### Para WhatsApp Admin
1. **Conectar**: Use o QR Code para conectar WhatsApp
2. **Enviar Confirmações**: Confirme agendamentos automaticamente
3. **Relatórios**: Envie relatórios diários/semanais/mensais
4. **Cancelamentos**: Cancele agendamentos em massa

## 🔌 API Endpoints

### Frontend API (/api/frontend)
- `GET /services` - Listar serviços
- `GET /appointments` - Listar agendamentos
- `GET /employees` - Listar colaboradores
- `GET /clients` - Listar clientes
- `POST /appointments` - Criar agendamento

### WhatsApp API (/api/whatsapp)
- `GET /status` - Status da conexão WhatsApp
- `POST /connect` - Conectar WhatsApp
- `POST /disconnect` - Desconectar WhatsApp
- `POST /send-bulk-confirmations` - Enviar confirmações
- `POST /cancel-confirmations` - Cancelar confirmações
- `POST /send-report-daily` - Relatório diário
- `POST /send-report-weekly` - Relatório semanal
- `POST /send-report-monthly` - Relatório mensal
- `GET /qr-code` - Obter QR Code
- `GET /today-appointments` - Agendamentos de hoje
- `GET /pending-appointments` - Agendamentos pendentes

## 💾 Banco de Dados

### Estrutura dos Arquivos JSON

#### agendamentos.json
```json
{
  "id": 1,
  "cliente_nome": "João Silva",
  "cliente_telefone": "11999999999",
  "servico_nome": "Corte Masculino",
  "servico_preco": 35,
  "colaborador_nome": "Carlos",
  "data_agendamento": "2025-01-15",
  "horario": "14:00",
  "status": "pendente",
  "observacoes": "Cliente preferencial"
}
```

#### clientes.json
```json
{
  "id": 1,
  "nome": "João Silva",
  "telefone": "11999999999",
  "email": "joao@email.com",
  "data_cadastro": "2025-01-01"
}
```

#### servicos.json
```json
{
  "id": 1,
  "nome": "Corte Masculino",
  "descricao": "Corte tradicional masculino",
  "preco": 35,
  "duracao": 45,
  "ativo": true
}
```

## 📱 WhatsApp Integration

### Recursos WhatsApp
- **Autenticação Persistente**: Login mantido entre reinicializações
- **QR Code Web**: Interface para escaneamento
- **Mensagens Personalizadas**: Templates customizáveis
- **Confirmações Automáticas**: Envio em massa
- **Relatórios**: Envio automático de estatísticas
- **Logs Completos**: Histórico de mensagens

### Configuração de Templates
Edite `database/message_templates.json`:

```json
{
  "confirmacao": "Olá {nome}! Seu agendamento para {data} às {hora} foi confirmado. Até breve!",
  "cancelamento": "Olá {nome}! Seu agendamento para {data} foi cancelado.",
  "lembrete": "Olá {nome}! Lembramos que você tem agendamento hoje às {hora}."
}
```

### Variáveis Disponíveis
- `{nome}` - Nome do cliente
- `{data}` - Data do agendamento
- `{hora}` - Horário do agendamento
- `{servico}` - Nome do serviço
- `{preco}` - Preço do serviço
- `{colaborador}` - Nome do colaborador

## 🔧 Troubleshooting

### Problemas Comuns

#### WhatsApp não conecta
1. Verifique se o celular está conectado à internet
2. Certifique-se que o WhatsApp Web não está sendo usado em outro dispositivo
3. Tente desconectar e reconectar
4. Verifique os logs em `database/whatsapp_logs.json`

#### Agendamentos não aparecem
1. Verifique se o servidor está rodando
2. Confirme se os dados estão sendo salvos em `database/agendamentos.json`
3. Verifique o console do navegador para erros
4. Teste a API diretamente: `GET /api/frontend/appointments`

#### Erro de porta em uso
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

#### Problemas de permissão de arquivo
```bash
# Linux/Mac
chmod 755 database/
chmod 644 database/*.json
```

### Logs e Debug

#### Verificar Logs WhatsApp
```bash
tail -f database/whatsapp_logs.json
```

#### Verificar Status da API
```bash
curl http://localhost:8080/api/whatsapp/status
```

#### Testar Conexão
```bash
curl http://localhost:8080/api/frontend/appointments
```

## 📊 Monitoramento

### Métricas Disponíveis
- **Agendamentos por dia**: Contador de agendamentos
- **Receita total**: Soma dos valores dos serviços
- **Clientes únicos**: Número de clientes diferentes
- **Taxa de conclusão**: Percentual de serviços finalizados
- **Avaliações médias**: Rating médio dos serviços

### Relatórios WhatsApp
- **Diário**: Resumo do dia atual
- **Semanal**: Resumo dos últimos 7 dias
- **Mensal**: Resumo do mês atual

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente
2. Use PM2 para gerenciar processos
3. Configure proxy reverso (Nginx)
4. Configure SSL/HTTPS
5. Configure backup automático dos dados

### PM2 Setup
```bash
npm install -g pm2
pm2 start server.js --name "barbearia-system"
pm2 startup
pm2 save
```

## 📝 Changelog

### v1.0.0 - Sistema Completo
- ✅ Sistema de agendamentos online
- ✅ Painel administrativo
- ✅ Integração WhatsApp completa
- ✅ Relatórios automáticos
- ✅ Sistema de avaliações
- ✅ Gestão de colaboradores
- ✅ API REST completa

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no GitHub
- Verifique a documentação da API
- Consulte a seção Troubleshooting

---

**Sistema de Barbearia v1.0.0** - Desenvolvido com ❤️ para facilitar a gestão de barbearias e salões.