#!/usr/bin/env pwsh

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ChocoChoco Indexer - Database Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose your database setup:" -ForegroundColor Yellow
Write-Host "1. Docker PostgreSQL (recommended for production-like setup)"
Write-Host "2. SQLite (easiest, best for development)"
Write-Host ""

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Checking Docker status..." -ForegroundColor Cyan

    # Check if Docker is running
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker is not running!" -ForegroundColor Red
            Write-Host ""
            Write-Host "To start Docker Desktop:" -ForegroundColor Cyan
            Write-Host "1. Open Docker Desktop from Start Menu"
            Write-Host "2. Wait for it to fully start"
            Write-Host "3. Run this script again"
            exit 1
        }
    } catch {
        Write-Host "❌ Docker is not running!" -ForegroundColor Red
        Write-Host ""
        Write-Host "To start Docker Desktop:" -ForegroundColor Cyan
        Write-Host "1. Open Docker Desktop from Start Menu"
        Write-Host "2. Wait for it to fully start"
        Write-Host "3. Run this script again"
        exit 1
    }

    Write-Host ""
    Write-Host "🐳 Starting PostgreSQL container..." -ForegroundColor Cyan

    # Check if container already exists
    $existing = docker ps -a --filter "name=chocochoco-postgres" --format "{{.Names}}"
    if ($existing -eq "chocochoco-postgres") {
        Write-Host "Container already exists. Starting it..." -ForegroundColor Yellow
        docker start chocochoco-postgres
    } else {
        docker run --name chocochoco-postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=chocochoco_indexer `
            -p 5432:5432 `
            -d postgres:14
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL container started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database URL: postgresql://postgres:postgres@localhost:5432/chocochoco_indexer" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. pnpm migrate    # Run database migrations"
        Write-Host "2. pnpm dev        # Start indexer"
        Write-Host ""
        Write-Host "Manage container:" -ForegroundColor Yellow
        Write-Host "- Stop:   docker stop chocochoco-postgres"
        Write-Host "- Start:  docker start chocochoco-postgres"
        Write-Host "- Remove: docker rm -f chocochoco-postgres"
    } else {
        Write-Host "❌ Failed to start container" -ForegroundColor Red
        Write-Host "Try SQLite instead (run script again and choose option 2)"
    }
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📦 Setting up SQLite..." -ForegroundColor Cyan

    # Update .env
    if (Test-Path ".env") {
        $envContent = Get-Content .env -Raw
        $envContent = $envContent -replace 'DATABASE_URL=postgresql.*', 'DATABASE_URL=sqlite:./dev.db'
        Set-Content .env $envContent
        Write-Host "✅ Updated .env with SQLite URL" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env not found. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        $envContent = Get-Content .env -Raw
        $envContent = $envContent -replace 'DATABASE_URL=postgresql.*', 'DATABASE_URL=sqlite:./dev.db'
        Set-Content .env $envContent
        Write-Host "✅ Created .env with SQLite URL" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Installing SQLite dependencies..." -ForegroundColor Cyan
    pnpm add better-sqlite3 @types/better-sqlite3

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQLite setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database URL: sqlite:./dev.db" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. pnpm migrate    # Run database migrations"
        Write-Host "2. pnpm dev        # Start indexer"
        Write-Host ""
        Write-Host "Note: SQLite is great for development but not for production." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to install SQLite dependencies" -ForegroundColor Red
    }
} else {
    Write-Host "Invalid choice. Please run again and choose 1 or 2." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setup complete! 🎉" -ForegroundColor Green
