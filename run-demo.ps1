# Run the CaseForge AI demo with test credentials
# Credentials should be provided as parameters or set in environment variables
param(
    [string]$Email = $env:TEST_EMAIL,
    [string]$Password = $env:TEST_PASSWORD
)

# Validate credentials are provided
if (-not $Email -or -not $Password) {
    Write-Error "Error: TEST_EMAIL and TEST_PASSWORD must be provided via parameters or environment variables"
    Write-Host "Usage: .\run-demo.ps1 -Email 'test@example.com' -Password 'password'"
    Write-Host "   Or set environment variables: `$env:TEST_EMAIL='test@example.com'; `$env:TEST_PASSWORD='password'"
    exit 1
}

# Set environment variables for the demo script
$env:TEST_EMAIL = $Email
$env:TEST_PASSWORD = $Password

# Run the demo
node "$PSScriptRoot\demo-script.cjs"
Write-Host "Demo complete. Video saved to: $PSScriptRoot\screenshots\demo-CaseForge-AI.webm"