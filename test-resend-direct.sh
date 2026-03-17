#!/bin/bash

echo "🧪 Testing Resend API Directly"
echo "================================"

# Test Resend API with curl
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_Vg1aNzzu_4YHvgi2HrYtocpbURnaEQ4zP" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "CreateHub <noreply@createhub.app>",
    "to": ["nicholasmbaluka05@gmail.com"],
    "subject": "Test Email from CreateHub 🧪",
    "html": "<div style=\"font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;\"><h2 style=\"color: #667eea;\">Test Email</h2><p>This is a test email from your CreateHub platform!</p><p>Your Resend API key is working correctly! 🎉</p></div>"
  }'

echo ""
echo "✅ If you see an email ID above, check your inbox!"
echo "❌ If you see an error, check the API key"
