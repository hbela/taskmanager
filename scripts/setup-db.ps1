# TaskManager - Quick Start with Docker PostgreSQL
# This script sets up a local PostgreSQL database using Docker

Write-Host "🚀 TaskManager - Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if container already exists
$containerExists = docker ps -a --filter "name=taskmanager-db" --format "{{.Names}}"

if ($containerExists) {
    Write-Host ""
    Write-Host "Container 'taskmanager-db' already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and create a new one? (y/N)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Stopping and removing existing container..." -ForegroundColor Yellow
        docker stop taskmanager-db | Out-Null
        docker rm taskmanager-db | Out-Null
        Write-Host "✓ Removed existing container" -ForegroundColor Green
    } else {
        Write-Host "Using existing container..." -ForegroundColor Yellow
        docker start taskmanager-db | Out-Null
        Write-Host "✓ Started existing container" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database is ready at: postgresql://postgres:postgres@localhost:5432/taskmanager" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Run: pnpm db:migrate" -ForegroundColor White
        Write-Host "2. Run: pnpm dev:api" -ForegroundColor White
        exit 0
    }
}

# Create new container
Write-Host ""
Write-Host "Creating PostgreSQL container..." -ForegroundColor Yellow

docker run --name taskmanager-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=taskmanager `
  -p 5432:5432 `
  -d postgres:16-alpine

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL container created successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "✓ Database is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Database Connection Info:" -ForegroundColor Cyan
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host "  Database: taskmanager" -ForegroundColor White
    Write-Host "  User: postgres" -ForegroundColor White
    Write-Host "  Password: postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "  Connection String:" -ForegroundColor White
    Write-Host "  postgresql://postgres:postgres@localhost:5432/taskmanager" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Your .env files are already configured with this connection!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Configure Google OAuth credentials in .env files" -ForegroundColor White
    Write-Host "2. Run: pnpm db:migrate" -ForegroundColor White
    Write-Host "3. Run: pnpm dev:api" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "  Stop database:    docker stop taskmanager-db" -ForegroundColor Gray
    Write-Host "  Start database:   docker start taskmanager-db" -ForegroundColor Gray
    Write-Host "  View logs:        docker logs taskmanager-db" -ForegroundColor Gray
    Write-Host "  Remove database:  docker rm -f taskmanager-db" -ForegroundColor Gray
    Write-Host "  Prisma Studio:    pnpm db:studio" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to create PostgreSQL container" -ForegroundColor Red
    exit 1
}
