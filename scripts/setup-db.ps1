# SecureBank Database Setup Script (Windows PowerShell)
Param(
    [string]$DbUser = "postgres",
    [string]$DbPassword = $env:DB_PASSWORD,
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "securebank_db"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       SecureBank - Local PostgreSQL Initialization       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Locate psql
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $psqlPath) {
    $candidates = Get-ChildItem "C:\Program Files\PostgreSQL" -Filter "psql.exe" -Recurse -ErrorAction SilentlyContinue
    if ($candidates) {
        $psqlPath = $candidates[0].FullName
    }
}

if (-not $psqlPath) {
    Write-Host "[ERROR] Could not find psql.exe on PATH or in C:\Program Files\PostgreSQL." -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is installed and psql is accessible." -ForegroundColor Yellow
    Exit 1
}

Write-Host "[INFO] Using psql binary at: $psqlPath" -ForegroundColor Green

if (-not $DbPassword) {
    $DbPassword = Read-Host -Prompt "Enter PostgreSQL password for user '$DbUser'"
}

$env:PGPASSWORD = $DbPassword

Write-Host "[INFO] Checking connection to PostgreSQL server on ${DbHost}:$DbPort..." -ForegroundColor Yellow
$testOutput = & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT version();" -w 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to connect to PostgreSQL: $testOutput" -ForegroundColor Red
    Write-Host "Please verify the password and check if the Windows Service 'postgresql-x64-XX' is running." -ForegroundColor Yellow
    Exit 1
}

Write-Host "[SUCCESS] Connected to PostgreSQL server." -ForegroundColor Green

# Check if database exists
Write-Host "[INFO] Checking if database '$DbName' exists..." -ForegroundColor Yellow
$dbExists = & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName';" -w
if ($dbExists.Trim() -eq "1") {
    Write-Host "[INFO] Database '$DbName' already exists." -ForegroundColor Green
} else {
    Write-Host "[INFO] Creating database '$DbName'..." -ForegroundColor Yellow
    & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d postgres -c "CREATE DATABASE $DbName ENCODING 'UTF8';" -w
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Database '$DbName' created successfully." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create database." -ForegroundColor Red
        Exit 1
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "PostgreSQL is configured! On backend startup, Flyway will " -ForegroundColor Green
Write-Host "automatically execute V1 (schema) and V2 (seed data).     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
