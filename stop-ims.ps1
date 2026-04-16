$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$pidFile = "$root\ims-processes.json"
if (-Not (Test-Path $pidFile)) {
    Write-Host "No PID file found. Nothing to stop."
    exit 0
}

try {
    $data = Get-Content $pidFile | ConvertFrom-Json
} catch {
    Write-Error "Could not read PID file: $_"
    exit 1
}

foreach ($key in $data.PSObject.Properties.Name) {
    $pid = $data.$key
    if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
        Write-Host "Stopping $key process PID $pid..."
        Stop-Process -Id $pid -Force
    } else {
        Write-Host "Process $key PID $pid not running."
    }
}

Remove-Item $pidFile -ErrorAction SilentlyContinue
Write-Host "Stopped saved IMS processes."