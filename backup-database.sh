#!/bin/bash

# ==============================================
# MySQL Database Backup Script
# ==============================================
# This script creates automated backups of the MySQL database
# Usage: ./backup-database.sh

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="golf_course_db"
DB_NAME="golf_course_db"
DB_USER="golf_user"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}Golf Course DB Backup Script${NC}"
echo -e "${GREEN}===============================================${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/golf_course_db_$DATE.sql.gz"

echo -e "${YELLOW}📦 Starting backup...${NC}"
echo -e "Container: $CONTAINER_NAME"
echo -e "Database: $DB_NAME"
echo -e "File: $BACKUP_FILE"

# Create backup
if docker exec $CONTAINER_NAME mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Delete backups older than retention period
echo -e "${YELLOW}🗑️  Cleaning up old backups (>$RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "golf_course_db_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✅ Cleanup completed${NC}"

# List recent backups
echo -e "\n${YELLOW}📁 Recent backups:${NC}"
ls -lh "$BACKUP_DIR" | tail -n 5

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}Backup process completed!${NC}"
echo -e "${GREEN}===============================================${NC}"
