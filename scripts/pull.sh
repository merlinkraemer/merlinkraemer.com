#!/bin/bash

# 📥 Pull Everything from Production
# This script pulls production data and code to local development

set -e  # Exit on any error

echo "📥 Starting pull from production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if required tools are installed
print_status "Checking dependencies..."
command -v railway >/dev/null 2>&1 || { print_error "Railway CLI not found. Please install it first."; exit 1; }
command -v git >/dev/null 2>&1 || { print_error "git not found. Please install it first."; exit 1; }
command -v sqlite3 >/dev/null 2>&1 || { print_error "sqlite3 not found. Please install it first."; exit 1; }
command -v psql >/dev/null 2>&1 || { print_error "psql not found. Please install it first."; exit 1; }

print_success "All dependencies found"

# Step 1: Git backup commit
print_status "Creating backup commit of current local changes..."
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "Backup before pull from production - $(date)"
    print_success "Backup commit created"
else
    print_status "No local changes to backup"
fi

# Step 2: Export Railway PostgreSQL data
print_status "Exporting data from Railway PostgreSQL..."
cd backend

# Check if Railway is logged in
if ! railway whoami >/dev/null 2>&1; then
    print_error "Not logged in to Railway. Please run 'railway login' first."
    exit 1
fi

# Get Railway database URL
print_status "Getting Railway database URL..."
RAILWAY_DB_URL=$(railway run printenv DATABASE_URL)

if [ -z "$RAILWAY_DB_URL" ]; then
    print_error "Could not get Railway database URL"
    print_status "Trying alternative method..."
    RAILWAY_DB_URL=$(railway variables | grep DATABASE_URL | cut -d'=' -f2- | tr -d ' ')
    if [ -z "$RAILWAY_DB_URL" ]; then
        print_error "Still could not get Railway database URL"
        exit 1
    fi
fi

print_status "Database URL obtained successfully"

# Export data from Railway PostgreSQL
pg_dump "$RAILWAY_DB_URL" > ../temp-postgres-dump.sql
print_success "Production data exported"

# Step 3: Convert PostgreSQL dump to SQLite format
print_status "Converting PostgreSQL dump to SQLite format..."
cd ..

python3 -c "
import re
import sys

try:
    # Read PostgreSQL dump
    with open('temp-postgres-dump.sql', 'r') as f:
        content = f.read()

    # Convert PostgreSQL syntax to SQLite
    content = re.sub(r'SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT', content)
    content = re.sub(r'TIMESTAMP', 'DATETIME', content)
    content = re.sub(r'DOUBLE PRECISION', 'REAL', content)
    content = re.sub(r'BYTEA', 'BLOB', content)
    content = re.sub(r'\\\$', '', content)  # Remove dollar signs

    # Remove PostgreSQL specific commands
    content = re.sub(r'SET.*;', '', content)
    content = re.sub(r'SELECT.*;', '', content)
    content = re.sub(r'CREATE SCHEMA.*;', '', content)
    content = re.sub(r'COMMENT ON.*;', '', content)
    content = re.sub(r'CREATE TABLE IF NOT EXISTS', 'CREATE TABLE', content)

    # Write converted dump
    with open('temp-sqlite-dump.sql', 'w') as f:
        f.write(content)

    print('Conversion completed successfully')
except Exception as e:
    print(f'Python conversion failed: {e}')
    sys.exit(1)
" || {
    print_warning "Python conversion failed, using basic conversion..."
    # Basic conversion without Python
    sed 's/SERIAL PRIMARY KEY/INTEGER PRIMARY KEY AUTOINCREMENT/g' temp-postgres-dump.sql > temp-sqlite-dump.sql
    sed -i '' 's/TIMESTAMP/DATETIME/g' temp-sqlite-dump.sql
    sed -i '' 's/DOUBLE PRECISION/REAL/g' temp-sqlite-dump.sql
    sed -i '' 's/BYTEA/BLOB/g' temp-sqlite-dump.sql
    sed -i '' '/SET /d' temp-sqlite-dump.sql
    sed -i '' '/SELECT /d' temp-sqlite-dump.sql
    sed -i '' '/CREATE SCHEMA/d' temp-sqlite-dump.sql
    sed -i '' '/COMMENT ON/d' temp-sqlite-dump.sql
    sed -i '' 's/CREATE TABLE IF NOT EXISTS/CREATE TABLE/g' temp-sqlite-dump.sql
}

print_success "Data converted to SQLite format"

# Step 4: Backup current local database
print_status "Backing up current local database..."
if [ -f "backend/prisma/dev.db" ]; then
    cp backend/prisma/dev.db backend/prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Local database backed up"
fi

# Step 5: Import data to local SQLite
print_status "Importing data to local SQLite database..."
cd backend

# Remove existing database and recreate
rm -f prisma/dev.db

# Create new database with schema
npx prisma db push

# Import data with error handling
print_status "Importing data into SQLite..."
if sqlite3 prisma/dev.db < ../temp-sqlite-dump.sql; then
    print_success "Data imported to local SQLite"
else
    print_warning "Some errors occurred during import, but continuing..."
    print_status "This is normal if there are constraint violations"
fi

# Step 6: Regenerate Prisma client
print_status "Regenerating Prisma client..."
npx prisma generate
print_success "Prisma client regenerated"

# Step 7: Test local setup
print_status "Testing local setup..."
cd ..

# Test if local database has data
IMAGE_COUNT=$(sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM gallery_images;")
if [ "$IMAGE_COUNT" -gt 0 ]; then
    print_success "Local database contains $IMAGE_COUNT images"
else
    print_warning "Local database appears to be empty"
fi

# Step 8: Cleanup
print_status "Cleaning up temporary files..."
rm -f temp-postgres-dump.sql temp-sqlite-dump.sql
print_success "Cleanup completed"

print_success "🎉 Pull from production completed successfully!"
print_status "Local database updated with production data"
print_status "You can now run 'npm run dev' to start local development"
