# ============================================
# IMS - Complete Local Development Setup
# Prerequisites: Node.js 20+, PostgreSQL running on localhost:5432
# Usage: .\scripts\setup-local.ps1
# ============================================

param(
    [switch]$SkipDb = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Colors
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Cyan

function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor $Green }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor $Red }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor $Yellow }
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor $Blue }

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor $Blue
Write-Host "║   IMS - LOCAL DEVELOPMENT SETUP        ║" -ForegroundColor $Blue
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor $Blue

# Step 1: Check prerequisites
Write-Info "Step 1/5: Checking prerequisites..."

$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Error "Node.js not found. Please install Node.js 20+"
    exit 1
}
Write-Success "Node.js $nodeVersion installed"

$npmVersion = npm --version
Write-Success "npm $npmVersion installed"

# Step 2: Validate environment file
Write-Info "Step 2/5: Setting up environment configuration..."
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found. Creating from .env.development..."
    Copy-Item ".env.development" ".env" -Force
}
Write-Success ".env file exists"

# Step 3: Install dependencies
Write-Info "Step 3/5: Installing dependencies - may take a few minutes..."
npm install 2>&1 | Select-String -Pattern 'added|audited|ERR' | ForEach-Object {
    if ($_.ToString() -match "ERR") {
        Write-Error "npm install failed: $_"
        exit 1
    }
}
Write-Success "Dependencies installed"

# Step 4: Validate environment
Write-Info "Step 4/5: Validating environment variables..."
if (Test-Path "scripts/validate-env.js") {
    node scripts/validate-env.js
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Environment validation failed"
        exit 1
    }
}

# Step 5: Setup database (optional)
if (-not $SkipDb) {
    Write-Info "Step 5/5: Setting up database..."
    Write-Warning "Ensure PostgreSQL is running on localhost:5432"
    Write-Info "  - User: ims"
    Write-Info "  - Password: ims"
    Write-Info "  - Database: ims"
    
    $proceed = Read-Host "Is PostgreSQL running with these credentials? [y/n]"
    
    if ($proceed -eq "y" -or $proceed -eq "Y") {
        Write-Info "Running database setup - migrations and seed..."
        npm run db:setup
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database setup completed"
        } else {
            Write-Error "Database setup failed. Check your PostgreSQL connection."
            Write-Info "Troubleshooting:"
            Write-Info "  1. Ensure PostgreSQL is running: psql -U ims -d ims -h localhost"
            Write-Info "  2. Check DATABASE_URL in .env file"
            Write-Info "  3. Run: npm run db:setup manually after fixing the issue"
            exit 1
        }
    } else {
        Write-Warning "Skipped database setup. Run 'npm run db:setup' when ready."
    }
} else {
    Write-Info "Step 5/5: Skipped database setup - use --SkipDb flag"
}

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║   SETUP COMPLETE!                      ║" -ForegroundColor $Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor $Green

Write-Info "Next steps:"
Write-Host "  1. Start development server: npm run dev"
Write-Host "  2. API runs on: http://localhost:8080"
Write-Host "  3. Frontend runs on: http://localhost:3001"
Write-Host "  4. API Docs: http://localhost:8080/api-docs"
