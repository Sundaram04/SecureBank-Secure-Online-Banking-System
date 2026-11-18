# Start SecureBank Backend (Spring Boot)
Param(
    [string]$DbPassword = $env:SPRING_DATASOURCE_PASSWORD
)

$backendDir = Join-Path $PSScriptRoot "..\backend"
Set-Location $backendDir

if ($DbPassword) {
    $env:SPRING_DATASOURCE_PASSWORD = $DbPassword
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Starting SecureBank Backend on Port 8080         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

mvn spring-boot:run
