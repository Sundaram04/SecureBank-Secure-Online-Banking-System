# Start SecureBank Frontend (React + Vite)
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Starting SecureBank Frontend on Port 5173        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

npm run dev
