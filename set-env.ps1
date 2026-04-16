# GitHub OAuth Environment Variables
# Copy this file to set-env.ps1 and replace the values with your actual GitHub OAuth app credentials

$env:GITHUB_CLIENT_ID = "Ov23lipGNQsjO5oFhS91"
$env:GITHUB_CLIENT_SECRET = "9057808c13ab3774b31a600dea377a2c87b50690"
$env:GITHUB_SCOPE = "user:email,repo"
$env:GITHUB_ORG_NAME = "esprithub"
$env:FRONTEND_URL = "https://esprithub.app"
$env:APP_CORS_ALLOWED_ORIGINS = "https://esprithub.app,https://www.esprithub.app"
$env:GITHUB_OAUTH_REDIRECT_URI = "https://esprithub.app/auth/github/callback"

# Local Docker Postgres database
$env:DOCKER_DB_HOST = "localhost"
$env:DOCKER_DB_PORT = "5433"
$env:DOCKER_DB_NAME = "esprithub"
$env:DOCKER_DB_USER = "esprithub_user"
$env:DOCKER_DB_PASSWORD = "esprithub_password"

$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://$($env:DOCKER_DB_HOST):$($env:DOCKER_DB_PORT)/$($env:DOCKER_DB_NAME)"
$env:SPRING_DATASOURCE_USERNAME = $env:DOCKER_DB_USER
$env:SPRING_DATASOURCE_PASSWORD = $env:DOCKER_DB_PASSWORD

# AI provider (NVIDIA OpenAI-compatible endpoint)
$env:AI_BASE_URL = "https://integrate.api.nvidia.com/v1"
$env:AI_MODEL = "minimaxai/minimax-m2.7"

# Optional key aliases:
# - AI_PROVIDER_API_KEY (recommended generic name)
# - OPENAI_API_KEY (legacy fallback)
if ([string]::IsNullOrWhiteSpace($env:NVIDIA_API_KEY) -and -not [string]::IsNullOrWhiteSpace($env:AI_PROVIDER_API_KEY)) {
	$env:NVIDIA_API_KEY = $env:AI_PROVIDER_API_KEY
}

if ([string]::IsNullOrWhiteSpace($env:NVIDIA_API_KEY) -and -not [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
	$env:NVIDIA_API_KEY = $env:OPENAI_API_KEY
}

# Never overwrite NVIDIA_API_KEY with an empty value.
# Keep the current shell value (or inherited environment value) if already set.

Write-Host "GitHub OAuth environment variables set!"
Write-Host "Client ID: $env:GITHUB_CLIENT_ID"
Write-Host "Client Secret: [HIDDEN]"
Write-Host "Scope: $env:GITHUB_SCOPE"
Write-Host "Organization: $env:GITHUB_ORG_NAME"
Write-Host "Frontend URL: $env:FRONTEND_URL"
Write-Host "CORS Origins: $env:APP_CORS_ALLOWED_ORIGINS"
Write-Host "OAuth Redirect URI: $env:GITHUB_OAUTH_REDIRECT_URI"
Write-Host "Datasource URL: $env:SPRING_DATASOURCE_URL"
Write-Host "Datasource Username: $env:SPRING_DATASOURCE_USERNAME"

Write-Host "Datasource Password: [HIDDEN]"

Write-Host "AI Base URL: $env:AI_BASE_URL"
Write-Host "AI Model: $env:AI_MODEL"

if ([string]::IsNullOrWhiteSpace($env:NVIDIA_API_KEY)) {
	Write-Host "WARNING: NVIDIA_API_KEY is not set. Set it before starting backend."
} else {
	Write-Host "NVIDIA API Key: [HIDDEN]"
}
