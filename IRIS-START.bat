@echo off
setlocal

set APP_DIR=C:\Front\laravel-front
set NGINX_DIR=C:\Nginx\nginx-1.26.2
set NGINX_PREFIX=C:/Front/nginx-runtime/
set NGINX_CONF=C:/Front/nginx-iris-only-9000.conf
set PHP_EXE=C:\php-8.3.10\php.exe
set POWERSHELL_EXE=C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

echo [IRIS] Starting Laravel + nginx on ports 9000 HTTP and 9443 HTTPS...
echo.

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

if not exist "%NGINX_DIR%\nginx.exe" (
    echo [ERROR] nginx.exe not found: %NGINX_DIR%\nginx.exe
    pause
    exit /b 1
)

if not exist C:\Front\nginx-runtime\logs mkdir C:\Front\nginx-runtime\logs
if not exist C:\Front\nginx-runtime\temp\client_body_temp mkdir C:\Front\nginx-runtime\temp\client_body_temp

"%POWERSHELL_EXE%" -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>nul
if errorlevel 1 (
    echo [IRIS] Laravel is not running. Starting port 8000...
    start "Laravel IRIS 8000" /min C:\Front\run-laravel-iris.cmd
    timeout /t 2 >nul
) else (
    echo [IRIS] Laravel is already listening on port 8000.
)

echo [IRIS] Testing nginx config...
cd /d "%NGINX_DIR%"
nginx.exe -t -p "%NGINX_PREFIX%" -c "%NGINX_CONF%"
if errorlevel 1 (
    echo [ERROR] nginx config test failed.
    pause
    exit /b 1
)

echo [IRIS] Reloading nginx...
nginx.exe -s reload -p "%NGINX_PREFIX%" -c "%NGINX_CONF%" >nul 2>nul
if errorlevel 1 (
    echo [IRIS] nginx was not running. Starting nginx...
    start "" /min "%NGINX_DIR%\nginx.exe" -p "%NGINX_PREFIX%" -c "%NGINX_CONF%"
)

timeout /t 1 >nul
echo.
echo [IRIS] Status:
netstat -ano | findstr ":8000 "
netstat -ano | findstr ":9000 "
netstat -ano | findstr ":9443 "
echo.
echo Open on this PC:
echo   http://127.0.0.1:9000/iris-test
echo   https://localhost:9443/iris-test
echo.
echo Open from another PC:
echo   http://192.168.1.91:9000/iris-test
echo   https://192.168.1.91:9443/iris-test  ^(camera^)
echo.
echo If ESET asks, unblock nginx.exe once. No admin is required for this BAT.
echo.
pause
