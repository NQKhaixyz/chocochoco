# ========================================
# PostgreSQL Setup Script for Windows
# ========================================

Write-Host "ChocoChoco Indexer - Database Setup" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
    $dockerRunning = $true
} catch {
    Write-Host "Docker is not running" -ForegroundColor Red
    $dockerRunning = $false
}

if ($dockerRunning) {
    Write-Host ""
    Write-Host "Setting up PostgreSQL with Docker..." -ForegroundColor Cyan
    
    # Remove old container if exists
    Write-Host "Removing old container if exists..." -ForegroundColor Gray
    docker rm -f chocochoco-postgres 2>$null
    
    # Create new container
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Gray
    docker run --name chocochoco-postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=chocochoco_indexer `
        -e POSTGRES_USER=postgres `
        -p 5432:5432 `
        -d postgres:14
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
        
        Write-Host ""
        Write-Host "PostgreSQL is ready!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database Info:" -ForegroundColor Cyan
        Write-Host "  Host: localhost" -ForegroundColor White
        Write-Host "  Port: 5432" -ForegroundColor White
        Write-Host "  Database: chocochoco_indexer" -ForegroundColor White
        Write-Host "  User: postgres" -ForegroundColor White
        Write-Host "  Password: postgres" -ForegroundColor White
        Write-Host ""
        Write-Host "Connection String:" -ForegroundColor Cyan
        Write-Host "  postgresql://postgres:postgres@localhost:5432/chocochoco_indexer" -ForegroundColor White
        Write-Host ""
        Write-Host "Now you can run: pnpm dev" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Failed to create PostgreSQL container" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "Docker is not available. Please choose an option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Start Docker Desktop" -ForegroundColor Cyan
    Write-Host "  1. Open Docker Desktop application" -ForegroundColor Gray
    Write-Host "  2. Wait for it to start" -ForegroundColor Gray
    Write-Host "  3. Run this script again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Install PostgreSQL directly" -ForegroundColor Cyan
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host ""
}

