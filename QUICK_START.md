# 🚀 Guia Rápido - Sistema de Barbearia

## ⚡ Instalação em 5 Minutos

### 1️⃣ Pré-requisitos
```bash
# Verificar Node.js (v14+)
node --version

# Verificar NPM
npm --version
```

### 2️⃣ Download e Instalação
```bash
# Baixar projeto
git clone <repo-url>
cd SITE_MAIN_DEX-main

# Instalar dependências
npm install

# Iniciar servidor
npm start
```

### 3️⃣ Acessar Sistema
- **Site**: http://localhost:8080
- **Admin**: http://localhost:8080/colaborador
- **WhatsApp**: http://localhost:8080/whatsapp-admin

## 📱 Configuração WhatsApp

### Conectar WhatsApp
1. Acesse http://localhost:8080/whatsapp-admin
2. Clique "Conectar WhatsApp"
3. Escaneie QR Code com celular
4. Aguarde "Conectado"

### Testar Mensagem
1. No admin, clique "Enviar Confirmações"
2. Verifique se mensagens foram enviadas
3. Confirme recebimento no celular

## 🎯 Uso Básico

### Cliente Faz Agendamento
1. Acesse http://localhost:8080
2. Escolha serviço, data e horário
3. Preencha dados pessoais
4. Confirme agendamento

### Admin Gerencia Agendamentos
1. Login: http://localhost:8080/colaborador
2. Veja agendamentos pendentes
3. Clique "Finalizar" quando concluído
4. Use "Contatar" para WhatsApp

### WhatsApp Automático
1. "Enviar Confirmações" - confirma todos
2. "Cancelar Confirmações" - cancela todos
3. "Relatório Diário" - envia resumo
4. "Desconectar" - sai do WhatsApp

## 🔧 Comandos Úteis

### Iniciar/Parar Servidor
```bash
# Iniciar
npm start
node server.js

# Parar (Ctrl+C)
# Ou matar processo
pkill -f node
```

### Verificar Status
```bash
# Testar API
curl http://localhost:8080/api/frontend/appointments

# Verificar WhatsApp
curl http://localhost:8080/api/whatsapp/status
```

### Backup Dados
```bash
# Copiar dados
cp -r database/ backup-$(date +%Y%m%d)/

# Restaurar dados
cp -r backup-20250115/database/ ./
```

## 🚨 Problemas Comuns

### WhatsApp não conecta
```bash
# Limpar sessão
rm -rf auth_info_baileys/
# Reiniciar servidor
npm start
```

### Porta ocupada
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Erro de permissão
```bash
# Linux/Mac
chmod 755 database/
chmod 644 database/*.json
```

## 📊 Verificar Sistema

### Status Geral
- ✅ Servidor rodando: http://localhost:8080
- ✅ API funcionando: 19 agendamentos
- ✅ WhatsApp conectado: Status OK
- ✅ Dados salvos: database/agendamentos.json

### Testes Rápidos
```bash
# Criar agendamento
curl -X POST http://localhost:8080/api/frontend/appointments \
  -H "Content-Type: application/json" \
  -d '{"cliente_nome":"Teste","cliente_telefone":"11999999999","servico_id":1,"data_agendamento":"2025-01-15","horario":"15:00"}'

# Ver agendamentos
curl http://localhost:8080/api/frontend/appointments | jq '.data | length'
```

## 🎯 Funcionalidades Principais

### ✅ Funcionando
- Agendamento online
- Painel administrativo
- WhatsApp integration
- Confirmações automáticas
- Relatórios diários/semanais/mensais
- Cancelamentos em massa
- Sistema de avaliações
- Gestão de colaboradores

### 📱 WhatsApp Features
- QR Code web interface
- Sessão persistente
- Templates personalizáveis
- Logs completos
- Rate limiting
- Reconexão automática

## 🔄 Manutenção Diária

### Verificações
- [ ] Servidor rodando
- [ ] WhatsApp conectado
- [ ] Novos agendamentos aparecendo
- [ ] Confirmações sendo enviadas
- [ ] Logs sem erros críticos

### Limpeza
- [ ] Rotacionar logs antigos
- [ ] Backup dados importantes
- [ ] Verificar espaço em disco
- [ ] Atualizar dependências (mensal)

## 🚀 Deploy Produção

### PM2 Setup
```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start server.js --name "barbearia"

# Configurar startup
pm2 startup
pm2 save
```

### Nginx Config
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com
```

## 📞 Suporte Rápido

### Logs Importantes
- **Servidor**: Console do terminal
- **WhatsApp**: database/whatsapp_logs.json
- **Erros**: Console do navegador (F12)

### Comandos Debug
```bash
# Ver logs em tempo real
tail -f database/whatsapp_logs.json

# Verificar processos
ps aux | grep node

# Verificar portas
netstat -tulpn | grep :8080
```

### Reset Completo
```bash
# Parar tudo
pkill -f node

# Limpar sessão WhatsApp
rm -rf auth_info_baileys/

# Reiniciar
npm start
```

---

**🎯 Sistema 100% Funcional em 5 minutos!**

**Acesso Rápido:**
- Site: http://localhost:8080
- Admin: http://localhost:8080/colaborador  
- WhatsApp: http://localhost:8080/whatsapp-admin

**Comandos Essenciais:**
- `npm start` - Iniciar
- `Ctrl+C` - Parar
- `npm install` - Instalar deps
