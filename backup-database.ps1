# ==============================================
# MySQL Database Backup Script (PowerShell)
# ==============================================
# This script creates automated backups of the MySQL database
# Usage: .\backup-database.ps1

param(
    [int]$RetentionDays = 30
)

# Configuration
$BackupDir = ".\backups"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$ContainerName = "golf_course_db"
$DBName = "golf_course_db"
$DBUser = "golf_user"
$DBPassword = "golf_password"  # Update this!

Write-Host "==============================================" -ForegroundColor Green
Write-Host "Golf Course DB Backup Script" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Backup filename
$BackupFile = Join-Path $BackupDir "golf_course_db_$Date.sql"
$BackupFileGz = "$BackupFile.gz"

Write-Host "`n📦 Starting backup..." -ForegroundColor Yellow
Write-Host "Container: $ContainerName"
Write-Host "Database: $DBName"
Write-Host "File: $BackupFile"

# Create backup
try {
    docker exec $ContainerName mysqldump -u $DBUser -p$DBPassword $DBName > $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        
        # Get file size
        $FileSize = (Get-Item $BackupFile).Length / 1MB
        Write-Host "File size: $([math]::Round($FileSize, 2)) MB"
        
        # Compress the backup (optional - requires 7-Zip or similar)
        # Compress-Archive -Path $BackupFile -DestinationPath "$BackupFile.zip"
        
    } else {
        throw "Backup command failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "❌ Backup failed: $_" -ForegroundColor Red
    exit 1
}

# Delete backups older than retention period
Write-Host "`n🗑️  Cleaning up old backups (>$RetentionDays days)..." -ForegroundColor Yellow
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "golf_course_db_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) }

if ($OldBackups) {
    $OldBackups | Remove-Item -Force
    Write-Host "Deleted $($OldBackups.Count) old backup(s)" -ForegroundColor Green
} else {
    Write-Host "No old backups to delete" -ForegroundColor Green
}

# List recent backups
Write-Host "`n📁 Recent backups:" -ForegroundColor Yellow
Get-ChildItem -Path $BackupDir -Filter "golf_course_db_*.sql" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 5 |
    ForEach-Object {
        $Size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.Name) - $Size MB - $($_.LastWriteTime)"
    }

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "Backup process completed!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
