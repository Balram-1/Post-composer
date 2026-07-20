@echo off
echo ============================================
echo   Post Composer - Starting Full App
echo ============================================
echo.

:: Start the backend in a separate window
echo Starting Backend (Express on port 3001)...
start "Post Composer - Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Small delay to let backend start first
timeout /t 3 /nobreak >nul

:: Start the frontend in a separate window
echo Starting Frontend (React on port 5173)...
start "Post Composer - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait a moment for Vite to boot up
timeout /t 4 /nobreak >nul

:: Open the browser automatically
echo.
echo ============================================
echo   Opening http://localhost:5173 in browser
echo ============================================
start http://localhost:5173

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
