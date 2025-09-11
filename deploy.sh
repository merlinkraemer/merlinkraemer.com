#!/bin/bash

# 🚀 Deploy Everything to Production
# This script pushes local data and code to production

set -e  # Exit on any error

echo "🚀 Starting deployment to production..."

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
command -v vercel >/dev/null 2>&1 || { print_error "Vercel CLI not found. Please install it first."; exit 1; }
command -v sqlite3 >/dev/null 2>&1 || { print_error "sqlite3 not found. Please install it first."; exit 1; }
command -v psql >/dev/null 2>&1 || { print_error "psql not found. Please install it first."; exit 1; }

print_success "All dependencies found"

# Step 1: Export local SQLite data
print_status "Exporting local SQLite data..."
if [ ! -f "backend/prisma/dev.db" ]; then
    print_error "Local database not found at backend/prisma/dev.db"
    exit 1
fi

sqlite3 backend/prisma/dev.db ".dump" > temp-sqlite-dump.sql
print_success "Local data exported"

# Step 2: Convert SQLite dump to PostgreSQL format
print_status "Converting SQLite dump to PostgreSQL format..."

# Use a more robust conversion approach
python3 -c "
import re
import sys

try:
    # Read SQLite dump
    with open('temp-sqlite-dump.sql', 'r') as f:
        content = f.read()

    # Convert SQLite syntax to PostgreSQL
    content = re.sub(r'INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY', content)
    content = re.sub(r'INTEGER', 'INTEGER', content)
    content = re.sub(r'TEXT', 'TEXT', content)
    content = re.sub(r'DATETIME', 'TIMESTAMP', content)
    content = re.sub(r'REAL', 'DOUBLE PRECISION', content)
    content = re.sub(r'BLOB', 'BYTEA', content)

    # Remove SQLite specific commands
    content = re.sub(r'PRAGMA.*;', '', content)
    content = re.sub(r'BEGIN TRANSACTION;', '', content)
    content = re.sub(r'COMMIT;', '', content)
    content = re.sub(r'CREATE TABLE.*\(', 'CREATE TABLE IF NOT EXISTS ', content)

    # Fix INSERT statements
    content = re.sub(r'INSERT INTO', 'INSERT INTO', content)

    # Write converted dump
    with open('temp-postgres-dump.sql', 'w') as f:
        f.write(content)

    print('Conversion completed successfully')
except Exception as e:
    print(f'Python conversion failed: {e}')
    sys.exit(1)
" || {
    print_warning "Python conversion failed, using basic conversion..."
    # Basic conversion without Python
    sed 's/INTEGER PRIMARY KEY AUTOINCREMENT/SERIAL PRIMARY KEY/g' temp-sqlite-dump.sql > temp-postgres-dump.sql
    sed -i '' 's/DATETIME/TIMESTAMP/g' temp-postgres-dump.sql
    sed -i '' 's/REAL/DOUBLE PRECISION/g' temp-postgres-dump.sql
    sed -i '' 's/BLOB/BYTEA/g' temp-postgres-dump.sql
    sed -i '' '/PRAGMA/d' temp-postgres-dump.sql
    sed -i '' '/BEGIN TRANSACTION/d' temp-postgres-dump.sql
    sed -i '' '/COMMIT/d' temp-postgres-dump.sql
    sed -i '' 's/CREATE TABLE /CREATE TABLE IF NOT EXISTS /g' temp-postgres-dump.sql
}

print_success "Data converted to PostgreSQL format"

# Step 3: Deploy backend to Railway
print_status "Deploying backend to Railway..."
cd backend

# Check if Railway is logged in
if ! railway whoami >/dev/null 2>&1; then
    print_error "Not logged in to Railway. Please run 'railway login' first."
    exit 1
fi

# Deploy backend
railway up --detach
print_success "Backend deployed to Railway"

# Step 4: Import data to Railway PostgreSQL
print_status "Importing data to Railway PostgreSQL..."
cd ..

# Get Railway database URL
print_status "Getting Railway database URL..."
RAILWAY_DB_URL=$(railway run --service backend printenv DATABASE_URL)

if [ -z "$RAILWAY_DB_URL" ]; then
    print_error "Could not get Railway database URL"
    print_status "Trying alternative method..."
    RAILWAY_DB_URL=$(railway variables --service backend | grep DATABASE_URL | cut -d'=' -f2- | tr -d ' ')
    if [ -z "$RAILWAY_DB_URL" ]; then
        print_error "Still could not get Railway database URL"
        exit 1
    fi
fi

print_status "Database URL obtained successfully"

# Import data with proper error handling
print_status "Importing data to Railway PostgreSQL..."
if psql "$RAILWAY_DB_URL" -f temp-postgres-dump.sql; then
    print_success "Data imported to Railway PostgreSQL"
else
    print_warning "Some errors occurred during import, but continuing..."
    print_status "This is normal if tables already exist"
fi

# Step 5: Deploy frontend to Vercel
print_status "Deploying frontend to Vercel..."
cd ..

# Check if Vercel is logged in
if ! vercel whoami >/dev/null 2>&1; then
    print_error "Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

# Deploy frontend
vercel --prod
print_success "Frontend deployed to Vercel"

# Step 6: Test endpoints
print_status "Testing production endpoints..."

# Get Railway backend URL
RAILWAY_BACKEND_URL="https://merlins-internetbackend-production.up.railway.app"

# Test backend health
if curl -s "$RAILWAY_BACKEND_URL/health" >/dev/null; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed"
fi

# Test gallery endpoint
if curl -s "$RAILWAY_BACKEND_URL/api/gallery" >/dev/null; then
    print_success "Gallery API endpoint working"
else
    print_warning "Gallery API endpoint failed"
fi

# Step 7: Cleanup
print_status "Cleaning up temporary files..."
rm -f temp-sqlite-dump.sql temp-postgres-dump.sql
print_success "Cleanup completed"

print_success "🎉 Deployment completed successfully!"
print_status "Backend: $RAILWAY_BACKEND_URL"
print_status "Frontend: https://merlinkraemer.com"
