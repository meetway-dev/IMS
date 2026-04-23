@echo off
REM IMS — Development Server
REM Starts API and frontend in separate terminal windows
REM Usage: dev.bat

echo.
echo Starting IMS development servers...
echo   API:       http://localhost:8080
echo   Frontend:  http://localhost:3001
echo.

start "IMS API" cmd /k "cd api && npm run start:dev"
start "IMS Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers launched in separate windows.
echo Close the terminal windows to stop them.
