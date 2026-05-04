#!/bin/bash

# MyMenuEG Deployment Script
# This script automates the deployment process on VPS

set -e  # Exit on error

echo "🚀 Starting MyMenuEG Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# 1. Pull latest changes
print_info "Pulling latest changes from GitHub..."
git pull origin main
print_success "Code updated"

# 2. Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# 3. Run database migrations
print_info "Running database migrations..."
cd backend/server
npx prisma migrate deploy
npx prisma generate
cd ../..
print_success "Database migrations completed"

# 4. Build the project
print_info "Building the project..."
npm run build
print_success "Build completed"

# 5. Restart backend with PM2
print_info "Restarting backend service..."
pm2 restart mymenueg-backend
print_success "Backend restarted"

# 6. Check PM2 status
print_info "Checking service status..."
pm2 status

# 7. Show recent logs
print_info "Recent logs:"
pm2 logs mymenueg-backend --lines 20 --nostream

print_success "🎉 Deployment completed successfully!"
print_info "Monitor logs with: pm2 logs mymenueg-backend"
