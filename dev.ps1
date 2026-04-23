# IMS — Development Server
# Starts API and frontend in separate terminal windows
# Usage: .\dev.ps1

Write-Host ""
Write-Host "Starting IMS development servers..." -ForegroundColor Cyan
Write-Host "  API:       http://localhost:8080" -ForegroundColor Gray
Write-Host "  Frontend:  http://localhost:3001" -ForegroundColor Gray
Write-Host ""

# Start API in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; Write-Host 'IMS API Server' -ForegroundColor Cyan; npm run start:dev"

# Start Frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'IMS Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host "Both servers launched in separate windows." -ForegroundColor Green
Write-Host "Close the terminal windows to stop them." -ForegroundColor Yellow
