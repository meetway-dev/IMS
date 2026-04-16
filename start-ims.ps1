$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Run-IfExists {
    param(
        [string]$path,
        [scriptblock]$action
    )
    if (Test-Path $path) {
        & $action
    } else {
        throw "Required path not found: $path"
    }
}

$install = $true
if ($PSBoundParameters.ContainsKey('SkipInstall')) { $install = $false }

if ($install) {
    Write-Host "Installing shared package dependencies..."
    Push-Location "$root\shared"
    npm install
    npm run build
    Pop-Location

    Write-Host "Installing API dependencies..."
    Push-Location "$root\api"
    npm install
    Pop-Location

    Write-Host "Installing frontend dependencies..."
    Push-Location "$root\frontend"
    npm install
    Pop-Location
}

Write-Host "Preparing database..."
Push-Location "$root\api"
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
Pop-Location

$processes = @{}

Write-Host "Starting backend server..."
$backend = Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit', '-Command', 'Set-Location "' + "$root\api" + '"; npm run start:dev'" -WorkingDirectory "$root\api" -PassThru
$processes.backend = $backend.Id

Write-Host "Starting frontend server..."
$frontend = Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit', '-Command', 'Set-Location "' + "$root\frontend" + '"; npm run dev'" -WorkingDirectory "$root\frontend" -PassThru
$processes.frontend = $frontend.Id

$processes | ConvertTo-Json | Set-Content "$root\ims-processes.json"

Write-Host "\nStarted backend and frontend."
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:3000"
Write-Host "PID file saved to ims-processes.json"