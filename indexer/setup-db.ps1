# Quick Start Script for ChocoChoco Indexer Database

Write-Host "🚀 ChocoChoco Indexer - Database Setup" -ForegroundColor Cyan
Write-Host ""

# Check Docker status
$dockerRunning = $false
try {
    docker ps *> $null
    $dockerRunning = $true
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "Choose database option:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL with Docker (recommended - requires Docker Desktop running)"
Write-Host "2. SQLite (easiest - no setup required)"
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    if (-not $dockerRunning) {
        Write-Host ""
        Write-Host "⚠️  Docker is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop first, then run this script again." -ForegroundColor Yellow
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
}
elseif ($choice -eq "2") {
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
