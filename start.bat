@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set PORT=8080

REM Already running? Just open the browser.
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [Label Studio] Already running. Opening browser...
    start http://localhost:%PORT%
    exit /b 0
)

if not exist logs mkdir logs

set DJANGO_DB=sqlite
set LOG_DIR=tmp
set DEBUG=true
set LOG_LEVEL=DEBUG
set LATEST_VERSION_CHECK=false
set COLLECT_ANALYTICS=false
set SENTRY_DSN=
set SENTRY_RATE=0

echo [Label Studio] Starting... first start takes 1-3 minutes, please wait.
start "Label Studio Server" /min cmd /c "uv run python label_studio\manage.py runserver 0.0.0.0:%PORT% --noreload 1> logs\runserver.out.log 2> logs\runserver.err.log"

set /a elapsed=0
:wait
timeout /t 5 /nobreak >nul
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [Label Studio] Ready! Opening browser...
    start http://localhost:%PORT%
    echo.
    echo To stop the server, run stop.bat
    exit /b 0
)
set /a elapsed+=5
echo Waiting for server... !elapsed!s elapsed
if !elapsed! geq 300 (
    echo.
    echo [Label Studio] Startup timed out after 5 minutes. Check logs\runserver.err.log
    exit /b 1
)
goto wait
