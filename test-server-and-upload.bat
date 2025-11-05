@echo off
cd /d %~dp0
echo Starting server...
start /b node dev-server.js > server-log.txt 2>&1
timeout /t 5 /nobreak > nul
echo.
echo Server started, running upload test...
echo.
node test-upload-direct.js
echo.
echo.
echo ===== Server Log =====
type server-log.txt
echo.
echo ===== End of Log =====


