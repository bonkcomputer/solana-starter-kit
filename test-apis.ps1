# API Health Check Script for Solana Starter Kit
Write-Host "=== SOLANA STARTER KIT API HEALTH CHECK ===" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"
$testWallet = "8whxaYtiM42aeTcQzJvdUsLeT5i374BLGzMf1aTyujbw"

# Function to test API endpoint
function Test-API {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "✅ SUCCESS - Status: $statusCode" -ForegroundColor Green
            
            # Try to parse JSON response
            try {
                $json = $response.Content | ConvertFrom-Json
                if ($json.PSObject.Properties.Count -gt 0) {
                    Write-Host "📄 Response has data" -ForegroundColor Cyan
                    
                    # Show specific info for different endpoints
                    if ($json.status) { Write-Host "   Status: $($json.status)" -ForegroundColor White }
                    if ($json.trades) { Write-Host "   Trades count: $($json.trades.Count)" -ForegroundColor White }
                    if ($json.tokens) { Write-Host "   Tokens count: $($json.tokens.Count)" -ForegroundColor White }
                    if ($json.nfts) { Write-Host "   NFTs count: $($json.nfts.Count)" -ForegroundColor White }
                    if ($json.profiles) { Write-Host "   Profiles count: $($json.profiles.Count)" -ForegroundColor White }
                    if ($json.totalValue) { Write-Host "   Total value: $($json.totalValue)" -ForegroundColor White }
                }
            } catch {
                Write-Host "📄 Response is not JSON or empty" -ForegroundColor Cyan
            }
        } else {
            Write-Host "⚠️  WARNING - Status: $statusCode" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test all major APIs
Write-Host "Starting API tests..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check APIs
Test-API "Health Check - Tapestry" "$baseUrl/api/health/tapestry"

# 2. Trading APIs
Test-API "Recent Trades" "$baseUrl/api/trades"

# 3. Token APIs
Test-API "Token Info - SOL" "$baseUrl/api/token?id=So11111111111111111111111111111111111111112"
Test-API "Token Info - BCT" "$baseUrl/api/token?id=D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk"
Test-API "Token Info - SSE" "$baseUrl/api/token?id=H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump"

# 4. Portfolio APIs
Test-API "Portfolio Data" "$baseUrl/api/portfolio?walletAddress=$testWallet"

# 5. Profile APIs
Test-API "Profiles by Wallet" "$baseUrl/api/profiles?walletAddress=$testWallet"
Test-API "All Profiles" "$baseUrl/api/profiles/all-profiles"

# 6. Social APIs
Test-API "Identities" "$baseUrl/api/identities?walletAddress=$testWallet"

Write-Host "=== API HEALTH CHECK COMPLETE ===" -ForegroundColor Green
Write-Host "All major endpoints have been tested." -ForegroundColor White 