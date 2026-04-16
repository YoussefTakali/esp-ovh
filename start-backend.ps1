# EspritHub Backend Startup Script
Write-Host "Starting EspritHub Backend..."
Write-Host ""
Write-Host "======== ADMIN CREDENTIALS ========"
Write-Host "Email: Youssef.Takali@esprit.tn"
Write-Host "Password: youssef123"
Write-Host "Role: ADMIN"
Write-Host "==================================="
Write-Host ""

# Ensure admin bootstrap values exist for automatic seeding.
if ([string]::IsNullOrWhiteSpace($env:BOOTSTRAP_ADMIN_EMAIL)) {
  $env:BOOTSTRAP_ADMIN_EMAIL = "Youssef.Takali@esprit.tn"
}
if ([string]::IsNullOrWhiteSpace($env:BOOTSTRAP_ADMIN_PASSWORD)) {
  $env:BOOTSTRAP_ADMIN_PASSWORD = "youssef123"
}
Write-Host "Admin bootstrap seeding enabled: $env:BOOTSTRAP_ADMIN_EMAIL"
Write-Host "Admin bootstrap password: [HIDDEN]"
Write-Host ""

# Set GitHub OAuth environment variables
Write-Host "Setting GitHub OAuth Configuration..."
$env:GITHUB_CLIENT_ID = "Ov23lipGNQsjO5oFhS91"
$env:GITHUB_CLIENT_SECRET = "c46874c8882454f060b386957420b8ebf50476f5"
$env:GITHUB_SCOPE = "user:email,repo"
$env:GITHUB_ORG_NAME = "esprithub"

# Force local Docker PostgreSQL to avoid stale session datasource values.
$env:DOCKER_DB_HOST = "localhost"
$env:DOCKER_DB_PORT = "5433"
$env:DOCKER_DB_NAME = "esprithub"
$env:DOCKER_DB_USER = "esprithub_user"
$env:DOCKER_DB_PASSWORD = "esprithub_password"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://$($env:DOCKER_DB_HOST):$($env:DOCKER_DB_PORT)/$($env:DOCKER_DB_NAME)"
$env:SPRING_DATASOURCE_USERNAME = $env:DOCKER_DB_USER
$env:SPRING_DATASOURCE_PASSWORD = $env:DOCKER_DB_PASSWORD

# Set NVIDIA AI provider environment variables
Write-Host "Setting NVIDIA AI Configuration..."
$env:AI_BASE_URL = "https://integrate.api.nvidia.com/v1"
$env:AI_MODEL = "minimaxai/minimax-m2.7"
# Keep NVIDIA_API_KEY from current shell/session. If needed, uncomment and set it:
# $env:NVIDIA_API_KEY = "your-nvidia-api-key"

Write-Host "Environment variables set!"
Write-Host "  Client ID: $env:GITHUB_CLIENT_ID"
Write-Host "  Client Secret: [HIDDEN]"
Write-Host "  Scope: $env:GITHUB_SCOPE"
Write-Host "  Organization: $env:GITHUB_ORG_NAME"
Write-Host "  Datasource URL: $env:SPRING_DATASOURCE_URL"
Write-Host "  Datasource Username: $env:SPRING_DATASOURCE_USERNAME"
Write-Host "  Datasource Password: [HIDDEN]"
Write-Host "  AI Base URL: $env:AI_BASE_URL"
Write-Host "  AI Model: $env:AI_MODEL"

if ([string]::IsNullOrWhiteSpace($env:NVIDIA_API_KEY)) {
  Write-Host "  NVIDIA API Key: NOT SET"
} else {
  Write-Host "  NVIDIA API Key: [HIDDEN]"
}

Write-Host ""

# Start the backend
Write-Host "Starting Spring Boot application..."
Set-Location "server"

# Start Maven
.\mvnw.cmd spring-boot:run