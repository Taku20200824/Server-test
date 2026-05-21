@echo off
setlocal

set NGINX_DIR=C:\Nginx\nginx-1.26.2
set NGINX_PREFIX=C:/Front/nginx-runtime/
set NGINX_CONF=C:/Front/nginx-iris-only-9000.conf
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo [IRIS] Stopping nginx + Laravel...
echo.

echo [IRIS] Stopping nginx listener on port 9000...
for /f "tokens=5" %%P in ('netstat -aon -p TCP ^| findstr "0.0.0.0:9000" ^| findstr LISTENING') do (
    "%POWERSHELL_EXE%" -NoProfile -Command Stop-Process -Id %%P -Force
    echo Stopped PID %%P
)

echo [IRIS] Stopping nginx listener on port 9443...
for /f "tokens=5" %%P in ('netstat -aon -p TCP ^| findstr "0.0.0.0:9443" ^| findstr LISTENING') do (
    "%POWERSHELL_EXE%" -NoProfile -Command Stop-Process -Id %%P -Force
    echo Stopped PID %%P
)

echo [IRIS] Stopping process listening on port 8000...
for /f "tokens=5" %%P in ('netstat -aon -p TCP ^| findstr "127.0.0.1:8000" ^| findstr LISTENING') do (
    "%POWERSHELL_EXE%" -NoProfile -Command Stop-Process -Id %%P -Force
    echo Stopped PID %%P
)

timeout /t 1 >nul
echo.
echo [IRIS] Remaining listeners:
netstat -ano | findstr ":8000 "
netstat -ano | findstr ":9000 "
netstat -ano | findstr ":9443 "
echo.
echo Done.
pause
