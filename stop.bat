@echo off
setlocal enabledelayedexpansion

set PORT=8080

echo [Label Studio] Stopping...

set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    echo Killing process %%a ...
    taskkill /PID %%a /T /F >nul 2>&1
    if not errorlevel 1 set FOUND=1
)

if "%FOUND%"=="0" (
    echo [Label Studio] No running server found.
) else (
    echo [Label Studio] Stopped.
)
