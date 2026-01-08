# Script para probar el proceso de renovación automática de contratos
# Ejecutar desde: apps/api

Write-Host "🔄 Probando proceso de renovación automática..." -ForegroundColor Cyan

# Primero, obtén tu token de autenticación
Write-Host "`n📝 Paso 1: Login para obtener token..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@rentmanager.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.data.token
Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green

# Ejecutar el proceso de renovación
Write-Host "`n🔄 Paso 2: Ejecutando proceso de renovación..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $renewalResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/leases/test-renewals" `
        -Method POST `
        -Headers $headers

    Write-Host "`n✅ Proceso completado exitosamente!" -ForegroundColor Green
    Write-Host "`n📊 Resultados:" -ForegroundColor Cyan
    Write-Host "   - Contratos renovados: $($renewalResponse.data.renewed)" -ForegroundColor White
    
    if ($renewalResponse.data.errors.Count -gt 0) {
        Write-Host "   - Errores: $($renewalResponse.data.errors.Count)" -ForegroundColor Red
        $renewalResponse.data.errors | ForEach-Object {
            Write-Host "     • $_" -ForegroundColor Red
        }
    } else {
        Write-Host "   - Sin errores ✓" -ForegroundColor Green
    }
    
    Write-Host "`n💬 Mensaje: $($renewalResponse.message)" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error al ejecutar el proceso:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n✨ Script completado" -ForegroundColor Cyan
