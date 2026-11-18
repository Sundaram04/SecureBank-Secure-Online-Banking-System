# Start SecureBank Full-Stack (Backend + Frontend)
Param(
    [string]$DbPassword = $env:SPRING_DATASOURCE_PASSWORD
)

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Launching SecureBank Online Banking Platform       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Starting Spring Boot Backend in new window..." -ForegroundColor Yellow
$backendCmd = "cd '$backendDir'; "
if ($DbPassword) {
    $backendCmd += "`$env:SPRING_DATASOURCE_PASSWORD='$DbPassword'; "
}
$backendCmd += "mvn spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting React Frontend in new window..." -ForegroundColor Yellow
$frontendCmd = "cd '$frontendDir'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "SecureBank is launching!" -ForegroundColor Green
Write-Host "  Backend API:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Frontend Web: http://localhost:5173" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
