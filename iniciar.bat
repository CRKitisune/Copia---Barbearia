@echo off
title Barbearia Nativa - Servidor
color 0A

echo.
echo ========================================
echo    BARBEARIA NATIVA - INICIANDO SERVIDOR
echo ========================================
echo.
echo 🚀 Iniciando servidor na porta 8080...
echo.
echo 📱 URLs para acessar:
echo    • Site Principal: http://192.168.0.100:8080/
echo    • Colaboradores: http://192.168.0.100:8080/sources/colaborador.html
echo    • API: http://192.168.0.100:8080/api/colaboradores
echo.
echo 💡 Para parar o servidor: Ctrl + C
echo.
echo ========================================
echo.

node server.js

pause
