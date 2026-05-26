@echo off
setlocal

set APP_DIR=C:\Front\laravel-front
set PHP_EXE=C:\php-8.3.10\php.exe
set TAILSCALE_EXE=C:\Program Files\Tailscale\tailscale.exe
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo [IRIS PUBLIC] Starting Laravel on 127.0.0.1:8000...

if not exist "%PHP_EXE%" (
    echo [ERROR] PHP not found: %PHP_EXE%
    pause
    exit /b 1
)

if not exist "%APP_DIR%\artisan" (
    echo [ERROR] Laravel artisan not found: %APP_DIR%\artisan
    pause
    exit /b 1
)

if not exist "%TAILSCALE_EXE%" (
    echo [ERROR] Tailscale not found: %TAILSCALE_EXE%
    pause
    exit /b 1
)

"%POWERSHELL_EXE%" -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { Start-Process -FilePath '%PHP_EXE%' -ArgumentList 'artisan','serve','--host=127.0.0.1','--port=8000' -WorkingDirectory '%APP_DIR%' -WindowStyle Hidden; exit 0 }"

timeout /t 2 >nul

echo [IRIS PUBLIC] Enabling Tailscale Funnel...
"%TAILSCALE_EXE%" funnel --bg 8000

echo.
echo [IRIS PUBLIC] Status:
"%TAILSCALE_EXE%" funnel status

echo.
echo Public URL:
echo   https://bvipc091.tail45ea62.ts.net/
echo.
pause
