@echo off
cd /d "%~dp0web"

echo [Frontend] Building...
call bun run build
if errorlevel 1 (
    echo [Frontend] Build FAILED. See output above.
    exit /b 1
)

cd /d "%~dp0"
copy /y "web\dist\apps\labelstudio\static\js\manifest.json" "label_studio\core\static_build\js\manifest.json" >nul
echo [Frontend] Done. Manifest synced to Django.
echo.
echo Next steps: run stop.bat, then start.bat, then hard-refresh the browser (Ctrl+F5).
