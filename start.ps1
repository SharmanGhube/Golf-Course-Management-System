# Golf Course Management System - Local Run Script
# This script starts the entire application using Docker Compose

Write-Host "🏌️ Starting Golf Course Management System..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Building and starting containers..." -ForegroundColor Cyan
Write-Host "   This may take 2-3 minutes on first run..." -ForegroundColor Yellow
Write-Host ""

# Start docker-compose
docker-compose up --build

# If user presses Ctrl+C, cleanup
Write-Host ""
Write-Host "🛑 Stopping containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Containers stopped" -ForegroundColor Green
