# ============================================
# COMPLETE FEATURE TEST SUITE
# ============================================

$baseUrl = "http://localhost:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CAMPUS MARKETPLACE - FEATURE TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. HEALTH CHECK
# ============================================
Write-Host "1️⃣ HEALTH CHECK" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    Write-Host "✅ Health Check: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================
# 2. REGISTER
# ============================================
Write-Host "2️⃣ REGISTER" -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@aastu.edu.et"
    password = "password123"
    department = "Computer Science"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success) {
        Write-Host "✅ Register Success!" -ForegroundColor Green
        Write-Host "   User: $($data.data.user.name) ($($data.data.user.email))" -ForegroundColor Gray
        $accessToken = $data.data.accessToken
        $refreshToken = $data.data.refreshToken
    } else {
        Write-Host "⚠️  Register: $($data.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  User may already exist. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# 3. LOGIN
# ============================================
Write-Host "3️⃣ LOGIN" -ForegroundColor Yellow
$loginBody = @{
    email = "test@aastu.edu.et"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success) {
        Write-Host "✅ Login Success!" -ForegroundColor Green
        Write-Host "   User: $($data.data.user.name) ($($data.data.user.email))" -ForegroundColor Gray
        $accessToken = $data.data.accessToken
        $refreshToken = $data.data.refreshToken
        Write-Host "   Access Token: $($accessToken.Substring(0, 30))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host "   Error: $responseBody" -ForegroundColor Red
}
Write-Host ""

# ============================================
# 4. REFRESH TOKEN
# ============================================
if ($refreshToken) {
    Write-Host "4️⃣ REFRESH TOKEN" -ForegroundColor Yellow
    $refreshBody = @{ refreshToken = $refreshToken } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/refresh" -Method POST -Body $refreshBody -ContentType "application/json" -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Write-Host "✅ Refresh Token Success!" -ForegroundColor Green
            Write-Host "   New Access Token: $($data.data.accessToken.Substring(0, 30))..." -ForegroundColor Gray
            $accessToken = $data.data.accessToken
        }
    } catch {
        Write-Host "❌ Refresh Token Failed!" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# 5. PROTECTED PROFILE
# ============================================
if ($accessToken) {
    Write-Host "5️⃣ PROTECTED PROFILE" -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $accessToken" }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/profile" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Write-Host "✅ Profile Access Success!" -ForegroundColor Green
            Write-Host "   User: $($data.data.name) ($($data.data.email))" -ForegroundColor Gray
            Write-Host "   Role: $($data.data.role)" -ForegroundColor Gray
            Write-Host "   Verified: $($data.data.isVerified)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Profile Access Failed!" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# 6. ADMIN USERS
# ============================================
if ($accessToken) {
    Write-Host "6️⃣ ADMIN USERS" -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $accessToken" }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Write-Host "✅ Admin Users Access Success!" -ForegroundColor Green
            Write-Host "   Users Count: $($data.data.Count)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Admin Users Access Failed (User may not be admin)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================
# 7. BAN USER (SKIP - Requires Admin)
# ============================================
Write-Host "7️⃣ BAN USER" -ForegroundColor Yellow
Write-Host "   ⏭️  Skipped (Admin role required)" -ForegroundColor Gray
Write-Host ""

# ============================================
# 8. SUPER ADMIN UNIVERSITIES
# ============================================
if ($accessToken) {
    Write-Host "8️⃣ SUPER ADMIN UNIVERSITIES" -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $accessToken" }
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/universities" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Write-Host "✅ Super Admin Access Success!" -ForegroundColor Green
            Write-Host "   Universities Count: $($data.data.Count)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Super Admin Access Failed (User may not be super admin)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# ============================================
# 9. DATABASE CHECK
# ============================================
Write-Host "9️⃣ DATABASE CHECK" -ForegroundColor Yellow
try {
    $universities = & "C:\Program Files\PostgreSQL\18\bin\psql" -U postgres -d campus_marketplace -t -c "SELECT COUNT(*) FROM universities;" 2>$null
    $users = & "C:\Program Files\PostgreSQL\18\bin\psql" -U postgres -d campus_marketplace -t -c "SELECT COUNT(*) FROM users;" 2>$null
    Write-Host "✅ Database Connected" -ForegroundColor Green
    Write-Host "   Universities: $universities" -ForegroundColor Gray
    Write-Host "   Users: $users" -ForegroundColor Gray
} catch {
    Write-Host "❌ Database Check Failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan