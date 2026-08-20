@echo off
setlocal

set TAILSCALE_EXE=C:\Program Files\Tailscale\tailscale.exe
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo [IRIS PUBLIC] Disabling Tailscale Funnel...
"%TAILSCALE_EXE%" funnel --https=443 off

echo [IRIS PUBLIC] Stopping Laravel on 127.0.0.1:8000...
for /f "tokens=5" %%P in ('netstat -aon -p TCP ^| findstr "127.0.0.1:8000" ^| findstr LISTENING') do (
    "%POWERSHELL_EXE%" -NoProfile -Command Stop-Process -Id %%P -Force
    echo Stopped PID %%P
)

echo.
echo Done.
pause
