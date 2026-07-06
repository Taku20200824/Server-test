@echo off
setlocal
rem ============================================
rem  IRIS Console - first-time setup
rem  Requires: PHP 8.3+, Composer, Node.js 20+
rem ============================================

set APP_DIR=%~dp0laravel-front

where php >nul 2>nul || (echo [ERROR] php not found in PATH & goto :fail)
where composer >nul 2>nul || (echo [ERROR] composer not found in PATH & goto :fail)
where npm >nul 2>nul || (echo [ERROR] npm not found in PATH & goto :fail)

cd /d "%APP_DIR%" || (echo [ERROR] laravel-front not found & goto :fail)

echo [1/5] composer install...
call composer install --no-interaction || goto :fail

echo [2/5] .env setup...
if not exist .env (
    copy .env.example .env >nul
    echo   .env created from .env.example
) else (
    echo   .env already exists - keeping it
)

echo [3/5] app key...
php artisan key:generate --force || goto :fail

echo [4/5] npm install...
call npm install || goto :fail

echo [5/5] build assets...
call npm run build || goto :fail

echo.
echo ============================================
echo  Setup complete.
echo  1. Edit laravel-front\.env  (APP_URL, IRIS_*)
echo  2. Local run : php artisan serve
echo  3. LAN run   : IRIS-START.bat
echo ============================================
pause
exit /b 0

:fail
echo.
echo [ERROR] Setup failed. See message above.
pause
exit /b 1
