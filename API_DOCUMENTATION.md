# 📚 Documentação da API - Sistema de Barbearia

## 🌐 Base URL
```
http://localhost:8080
```

## 📋 Índice da API

### Frontend API (`/api/frontend`)
- [GET /services](#get-services)
- [GET /appointments](#get-appointments)
- [GET /employees](#get-employees)
- [GET /clients](#get-clients)
- [POST /appointments](#post-appointments)

### WhatsApp API (`/api/whatsapp`)
- [GET /status](#get-whatsapp-status)
- [POST /connect](#post-whatsapp-connect)
- [POST /disconnect](#post-whatsapp-disconnect)
- [GET /qr-code](#get-qr-code)
- [POST /send-bulk-confirmations](#post-send-bulk-confirmations)
- [POST /cancel-confirmations](#post-cancel-confirmations)
- [POST /send-report-daily](#post-send-report-daily)
- [POST /send-report-weekly](#post-send-report-weekly)
- [POST /send-report-monthly](#post-send-report-monthly)
- [GET /today-appointments](#get-today-appointments)
- [GET /pending-appointments](#get-pending-appointments)

### CRUD APIs
- [Agendamentos API](#agendamentos-api)
- [Serviços API](#servicos-api)
- [Colaboradores API](#colaboradores-api)
- [Clientes API](#clientes-api)
- [Avaliações API](#avaliacoes-api)

---

## 🎯 Frontend API

### GET /services
**Descrição**: Lista todos os serviços disponíveis

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Corte Masculino",
      "descricao": "Corte tradicional masculino",
      "preco": 35,
      "duracao": 45,
      "ativo": true
    }
  ]
}
```

### GET /appointments
**Descrição**: Lista todos os agendamentos

**Resposta**:
```json
{
  "success": true,
  "data": [
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
  ]
}
```

### GET /employees
**Descrição**: Lista todos os colaboradores

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Carlos Silva",
      "cargo": "Barbeiro",
      "especialidades": ["Corte", "Barba"],
      "status": "ativo",
      "avaliacao": 4.5
    }
  ]
}
```

### GET /clients
**Descrição**: Lista todos os clientes

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "telefone": "11999999999",
      "email": "joao@email.com",
      "data_cadastro": "2025-01-01"
    }
  ]
}
```

### POST /appointments
**Descrição**: Cria um novo agendamento

**Body**:
```json
{
  "cliente_nome": "João Silva",
  "cliente_telefone": "11999999999",
  "servico_id": 1,
  "servico_nome": "Corte Masculino",
  "servico_preco": 35,
  "colaborador_id": 1,
  "colaborador_nome": "Carlos",
  "data_agendamento": "2025-01-15",
  "horario": "14:00",
  "duracao_estimada": 45,
  "forma_pagamento": "Dinheiro",
  "observacoes": "Cliente preferencial"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 20,
    "cliente_nome": "João Silva",
    "status": "pendente",
    "data_criacao": "2025-01-15T14:00:00.000Z"
  },
  "message": "Agendamento criado com sucesso"
}
```

---

## 📱 WhatsApp API

### GET /status
**Descrição**: Verifica o status da conexão WhatsApp

**Resposta**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "status": "connected",
    "phone": "5511999999999"
  }
}
```

### POST /connect
**Descrição**: Inicia conexão com WhatsApp

**Resposta**:
```json
{
  "success": true,
  "message": "Iniciando conexão WhatsApp..."
}
```

### POST /disconnect
**Descrição**: Desconecta do WhatsApp

**Resposta**:
```json
{
  "success": true,
  "message": "Desconectado do WhatsApp"
}
```

### GET /qr-code
**Descrição**: Obtém o QR Code para login

**Resposta**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### POST /send-bulk-confirmations
**Descrição**: Envia confirmações em massa para agendamentos de hoje

**Resposta**:
```json
{
  "success": true,
  "data": {
    "sent": 5,
    "failed": 0,
    "total": 5
  },
  "message": "Confirmações enviadas com sucesso"
}
```

### POST /cancel-confirmations
**Descrição**: Cancela todos os agendamentos de hoje

**Body**:
```json
{
  "data": "2025-01-15",
  "motivo": "Feriado"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "cancelled": 3,
    "total": 3
  },
  "message": "Agendamentos cancelados com sucesso"
}
```

### POST /send-report-daily
**Descrição**: Envia relatório diário

**Resposta**:
```json
{
  "success": true,
  "message": "Relatório diário enviado"
}
```

### POST /send-report-weekly
**Descrição**: Envia relatório semanal

**Resposta**:
```json
{
  "success": true,
  "message": "Relatório semanal enviado"
}
```

### POST /send-report-monthly
**Descrição**: Envia relatório mensal

**Resposta**:
```json
{
  "success": true,
  "message": "Relatório mensal enviado"
}
```

### GET /today-appointments
**Descrição**: Lista agendamentos de hoje

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cliente_nome": "João Silva",
      "horario": "14:00",
      "servico_nome": "Corte Masculino",
      "status": "pendente"
    }
  ],
  "count": 1,
  "today": "2025-01-15"
}
```

### GET /pending-appointments
**Descrição**: Lista agendamentos pendentes de hoje

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cliente_nome": "João Silva",
      "horario": "14:00",
      "servico_nome": "Corte Masculino",
      "status": "pendente"
    }
  ],
  "count": 1,
  "today": "2025-01-15"
}
```

---

## 🗄️ CRUD APIs

### Agendamentos API (`/api/agendamentos`)

#### GET /agendamentos
**Descrição**: Lista todos os agendamentos

#### GET /agendamentos/:id
**Descrição**: Busca agendamento por ID

#### POST /agendamentos
**Descrição**: Cria novo agendamento

#### PUT /agendamentos/:id
**Descrição**: Atualiza agendamento

#### DELETE /agendamentos/:id
**Descrição**: Remove agendamento

### Serviços API (`/api/servicos`)

#### GET /servicos
**Descrição**: Lista todos os serviços

#### GET /servicos/:id
**Descrição**: Busca serviço por ID

#### POST /servicos
**Descrição**: Cria novo serviço

#### PUT /servicos/:id
**Descrição**: Atualiza serviço

#### DELETE /servicos/:id
**Descrição**: Remove serviço

### Colaboradores API (`/api/colaboradores`)

#### GET /colaboradores
**Descrição**: Lista todos os colaboradores

#### GET /colaboradores/:id
**Descrição**: Busca colaborador por ID

#### POST /colaboradores
**Descrição**: Cria novo colaborador

#### PUT /colaboradores/:id
**Descrição**: Atualiza colaborador

#### DELETE /colaboradores/:id
**Descrição**: Remove colaborador

### Clientes API (`/api/clientes`)

#### GET /clientes
**Descrição**: Lista todos os clientes

#### GET /clientes/:id
**Descrição**: Busca cliente por ID

#### POST /clientes
**Descrição**: Cria novo cliente

#### PUT /clientes/:id
**Descrição**: Atualiza cliente

#### DELETE /clientes/:id
**Descrição**: Remove cliente

### Avaliações API (`/api/avaliacoes`)

#### GET /avaliacoes
**Descrição**: Lista todas as avaliações

#### GET /avaliacoes/:id
**Descrição**: Busca avaliação por ID

#### POST /avaliacoes
**Descrição**: Cria nova avaliação

#### PUT /avaliacoes/:id
**Descrição**: Atualiza avaliação

#### DELETE /avaliacoes/:id
**Descrição**: Remove avaliação

---

## 🔧 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autorizado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro interno do servidor |

## 📝 Estrutura de Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "data": { /* dados */ },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Descrição do erro",
  "message": "Mensagem detalhada do erro"
}
```

## 🔍 Exemplos de Uso

### Criar Agendamento via cURL
```bash
curl -X POST http://localhost:8080/api/frontend/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nome": "João Silva",
    "cliente_telefone": "11999999999",
    "servico_id": 1,
    "servico_nome": "Corte Masculino",
    "servico_preco": 35,
    "colaborador_id": 1,
    "colaborador_nome": "Carlos",
    "data_agendamento": "2025-01-15",
    "horario": "14:00",
    "duracao_estimada": 45,
    "forma_pagamento": "Dinheiro",
    "observacoes": "Cliente preferencial"
  }'
```

### Verificar Status WhatsApp
```bash
curl http://localhost:8080/api/whatsapp/status
```

### Listar Agendamentos
```bash
curl http://localhost:8080/api/frontend/appointments
```

### Enviar Confirmações
```bash
curl -X POST http://localhost:8080/api/whatsapp/send-bulk-confirmations
```

## 🚀 Rate Limiting

- **Frontend API**: 100 requests/minuto
- **WhatsApp API**: 50 requests/minuto
- **CRUD APIs**: 200 requests/minuto

## 🔐 Autenticação

Atualmente o sistema não possui autenticação JWT. A autenticação é baseada em:
- Sessões locais para o painel admin
- Validação de dados para APIs públicas
- Rate limiting para prevenir abuso

## 📊 Monitoramento

### Métricas Disponíveis
- **Requests/minuto**: Por endpoint
- **Tempo de resposta**: Por operação
- **Erros**: Por tipo e endpoint
- **Uso de memória**: Sistema geral

### Logs
- **Access Logs**: Todas as requisições
- **Error Logs**: Erros e exceções
- **WhatsApp Logs**: Mensagens enviadas/recebidas
- **Business Logs**: Operações de negócio

---

**API Documentation v1.0.0** - Sistema de Barbearia
