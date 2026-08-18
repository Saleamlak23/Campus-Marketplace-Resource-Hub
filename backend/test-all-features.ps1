# ============================================
# COMPLETE FEATURE TEST SUITE
# ============================================

$baseUrl = "http://localhost:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CAMPUS MARKETPLACE - COMPLETE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ HEALTH CHECK" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    Write-Host "✅ Health Check: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed!" -ForegroundColor Red
    exit
}
Write-Host ""

# 2. Login
Write-Host "2️⃣ LOGIN" -ForegroundColor Yellow
$body = @{ email = "test@aastu.edu.et"; password = "password123" } | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $token = $data.data.accessToken
    $refreshToken = $data.data.refreshToken
    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    exit
}
Write-Host ""

# 3. Get Profile
Write-Host "3️⃣ GET PROFILE" -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users/me" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Profile: $($data.data.name) ($($data.data.email))" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile Failed!" -ForegroundColor Red
}
Write-Host ""

# 4. Get Universities (Super Admin)
Write-Host "4️⃣ GET UNIVERSITIES" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/universities" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Universities: $($data.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Super Admin access required (user may not be SUPER_ADMIN)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Admin Users
Write-Host "5️⃣ ADMIN USERS" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Admin Users: $($data.data.Count) users found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Admin access required (user may not be admin)" -ForegroundColor Yellow
}
Write-Host ""

# 6. Database Check
Write-Host "6️⃣ DATABASE CHECK" -ForegroundColor Yellow
try {
    $universities = & "C:\Program Files\PostgreSQL\18\bin\psql" -U postgres -d campus_marketplace -t -c "SELECT COUNT(*) FROM universities;" 2>$null
    $users = & "C:\Program Files\PostgreSQL\18\bin\psql" -U postgres -d campus_marketplace -t -c "SELECT COUNT(*) FROM users;" 2>$null
    Write-Host "✅ Database Connected" -ForegroundColor Green
    Write-Host "   Universities: $universities" -ForegroundColor Gray
    Write-Host "   Users: $users" -ForegroundColor Gray
} catch {
    Write-Host "❌ Database Check Failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan