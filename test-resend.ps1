# Test Resend API with PowerShell
$apiKey = "re_Vg1aNzzu_4YHvgi2HrYtocpbURnaEQ4zP"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    "from" = "CreateHub <noreply@createhub.app>"
    "to" = @("nicholasmbaluka05@gmail.com")
    "subject" = "Test Email from CreateHub 🧪"
    "html" = "<div style='font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;'><h2 style='color: #667eea;'>Test Email</h2><p>This is a test email from your CreateHub platform!</p><p>Your Resend API key is working correctly! 🎉</p></div>"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.resend.com/emails" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS! Email sent to Resend API"
    Write-Host "📬 Check your inbox for the test email"
    Write-Host "📊 Email ID:" $response.id
} catch {
    Write-Host "❌ FAILED: Email not sent"
    Write-Host "🚨 Error:" $_.Exception.Message
}
