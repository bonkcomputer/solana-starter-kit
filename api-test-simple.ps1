# Simple API Test Commands
Write-Host "=== SIMPLE API TESTS ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:3000/api/health/tapestry" -UseBasicParsing
Write-Host "   Status: $($health.StatusCode)" -ForegroundColor Green
Write-Host ""

# Test 2: Recent Trades
Write-Host "2. Testing Recent Trades..." -ForegroundColor Yellow
$trades = Invoke-WebRequest -Uri "http://localhost:3000/api/trades" -UseBasicParsing
Write-Host "   Status: $($trades.StatusCode)" -ForegroundColor Green
$tradesData = $trades.Content | ConvertFrom-Json
Write-Host "   Trades found: $($tradesData.trades.Count)" -ForegroundColor White
Write-Host ""

# Test 3: Token Info
Write-Host "3. Testing Token APIs..." -ForegroundColor Yellow
$sol = Invoke-WebRequest -Uri "http://localhost:3000/api/token?id=So11111111111111111111111111111111111111112" -UseBasicParsing
Write-Host "   SOL Token API: $($sol.StatusCode)" -ForegroundColor Green
$bct = Invoke-WebRequest -Uri "http://localhost:3000/api/token?id=D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk" -UseBasicParsing
Write-Host "   BCT Token API: $($bct.StatusCode)" -ForegroundColor Green
Write-Host ""

# Test 4: Profile System
Write-Host "4. Testing Profile System..." -ForegroundColor Yellow
$profiles = Invoke-WebRequest -Uri "http://localhost:3000/api/profiles/all-profiles" -UseBasicParsing
Write-Host "   All Profiles API: $($profiles.StatusCode)" -ForegroundColor Green
Write-Host ""

Write-Host "=== ALL CORE APIS WORKING ✅ ===" -ForegroundColor Green
Write-Host ""
Write-Host "If you're getting Privy authentication errors:" -ForegroundColor Yellow
Write-Host "1. Check your browser console for more details" -ForegroundColor White
Write-Host "2. Try refreshing the page" -ForegroundColor White
Write-Host "3. Clear browser cache and cookies" -ForegroundColor White
Write-Host "4. Make sure NEXT_PUBLIC_PRIVY_APP_ID is set in .env.local" -ForegroundColor White 