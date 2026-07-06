@echo off
cd /d "%~dp0"
where npm >nul 2>nul && (call npm run build & goto :done)
rem fallback: local node runtime (this PC only)
if exist "C:\Users\PC091\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    "C:\Users\PC091\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js build
) else (
    echo [ERROR] npm/node not found in PATH
)
:done
pause
