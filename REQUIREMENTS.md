# 📋 Requisitos do Sistema - Sistema de Barbearia

## 🖥️ Requisitos do Sistema

### Sistema Operacional
- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15 ou superior
- **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 10+

### Hardware Mínimo
- **RAM**: 2GB (recomendado: 4GB)
- **CPU**: 2 cores (recomendado: 4 cores)
- **Disco**: 500MB livres
- **Internet**: Conexão estável para WhatsApp Web

### Hardware Recomendado
- **RAM**: 8GB
- **CPU**: 4 cores ou superior
- **Disco**: 1GB livres (SSD preferível)
- **Internet**: Banda larga estável

## 🔧 Requisitos de Software

### Essenciais
- **Node.js**: v14.0.0 ou superior
- **NPM**: v6.0.0 ou superior (vem com Node.js)
- **Git**: v2.0.0 ou superior (opcional, para clonagem)

### Navegadores Suportados
- **Chrome**: v80+ (recomendado)
- **Firefox**: v75+
- **Safari**: v13+
- **Edge**: v80+

### Dispositivo Móvel (WhatsApp)
- **Android**: 5.0+ (API 21+)
- **iOS**: 12.0+
- **WhatsApp**: Versão mais recente
- **Conexão**: 3G/4G/WiFi estável

## 📦 Dependências do Projeto

### Produção (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@whiskeysockets/baileys": "^6.6.0",
    "qrcode-terminal": "^0.12.0",
    "node-cron": "^3.0.3",
    "cors": "^2.8.5",
    "qrcode": "^1.5.3"
  }
}
```

### Desenvolvimento
```json
{
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## 🌐 Requisitos de Rede

### Portas Necessárias
- **8080**: Servidor principal (HTTP)
- **443**: HTTPS (se configurado)
- **80**: HTTP (se configurado)

### Firewall
- **Entrada**: Porta 8080 deve estar liberada
- **Saída**: Conexões HTTPS (443) para WhatsApp

### Proxy/Corporativo
- **HTTP Proxy**: Configurável via NODE_HTTP_PROXY
- **HTTPS Proxy**: Configurável via NODE_HTTPS_PROXY
- **Bypass**: WhatsApp APIs podem precisar de bypass

## 📱 Requisitos WhatsApp

### Conta WhatsApp
- **Número válido**: Telefone com WhatsApp ativo
- **Verificação**: Número deve receber SMS/código
- **Dispositivo**: Celular deve estar próximo para QR Code

### Limitações WhatsApp Business API
- **Mensagens**: Limite de 1000 mensagens/dia (contas novas)
- **Rate Limit**: Máximo 80 mensagens/minuto
- **Spam**: Evitar envios em massa não solicitados

## 🗄️ Requisitos de Dados

### Espaço em Disco
- **Base**: 50MB para instalação
- **Dados**: 10MB por 1000 agendamentos
- **Logs**: 5MB por mês de operação
- **Backup**: Espaço adicional para backups

### Permissões de Arquivo
- **Leitura**: Todos os arquivos JSON
- **Escrita**: Pasta database/
- **Execução**: Arquivos .js

### Backup
- **Frequência**: Diário (recomendado)
- **Retenção**: 30 dias (mínimo)
- **Local**: Servidor externo ou cloud

## 🔐 Requisitos de Segurança

### HTTPS (Produção)
- **Certificado SSL**: Válido e atualizado
- **TLS**: Versão 1.2 ou superior
- **Cipher**: AES-256 ou superior

### Firewall
- **WAF**: Web Application Firewall (opcional)
- **Rate Limiting**: Proteção contra DDoS
- **IP Whitelist**: Para acesso admin (opcional)

### Backup de Dados
- **Criptografia**: Dados sensíveis criptografados
- **Acesso**: Controle de acesso aos backups
- **Teste**: Restauração testada regularmente

## 🌍 Requisitos de Localização

### Fuso Horário
- **Sistema**: Configurado para localização correta
- **Node.js**: process.env.TZ configurado
- **Agendamentos**: Horários em formato local

### Idioma
- **Interface**: Português (Brasil)
- **Data**: Formato dd/mm/aaaa
- **Moeda**: Real (R$)
- **Telefone**: Formato brasileiro

## 📊 Requisitos de Performance

### Concurrent Users
- **Simultâneos**: Até 50 usuários
- **Agendamentos**: Até 500/dia
- **Mensagens**: Até 1000/dia

### Response Time
- **API**: < 500ms (95% das requisições)
- **Frontend**: < 2s carregamento inicial
- **WhatsApp**: < 5s para envio de mensagem

## 🔄 Requisitos de Manutenção

### Monitoramento
- **Uptime**: 99% disponibilidade
- **Logs**: Rotação diária
- **Métricas**: CPU, RAM, Disco

### Atualizações
- **Node.js**: Atualizações de segurança
- **Dependências**: Atualizações mensais
- **Sistema**: Patches de segurança

### Suporte
- **Documentação**: Mantida atualizada
- **Logs**: Sistema de logging configurado
- **Backup**: Estratégia de backup definida

## 🚀 Requisitos de Deploy

### Ambiente de Produção
- **Servidor**: VPS/Cloud com recursos adequados
- **Process Manager**: PM2 ou similar
- **Reverse Proxy**: Nginx ou Apache
- **SSL**: Certificado válido

### CI/CD (Opcional)
- **Git**: Controle de versão
- **Tests**: Testes automatizados
- **Deploy**: Deploy automatizado

## 📋 Checklist de Instalação

### Pré-Instalação
- [ ] Node.js v14+ instalado
- [ ] NPM funcionando
- [ ] Porta 8080 disponível
- [ ] Firewall configurado
- [ ] Permissões de arquivo corretas

### Instalação
- [ ] Repositório clonado/baixado
- [ ] `npm install` executado
- [ ] Dependências instaladas
- [ ] Configurações ajustadas

### Pós-Instalação
- [ ] Servidor iniciado
- [ ] Acesso web funcionando
- [ ] WhatsApp conectado
- [ ] Testes básicos realizados
- [ ] Backup configurado

## ⚠️ Limitações Conhecidas

### WhatsApp
- **QR Code**: Expira em 2 minutos
- **Sessões**: Limitadas por dispositivo
- **Rate Limit**: WhatsApp pode bloquear temporariamente

### Sistema
- **JSON**: Não é ideal para alta concorrência
- **Memória**: Cresce com número de agendamentos
- **Backup**: Manual (não automático)

### Rede
- **Internet**: Necessária para WhatsApp
- **Proxy**: Pode causar problemas
- **Firewall**: Pode bloquear conexões

---

**Requisitos v1.0.0** - Sistema de Barbearia
