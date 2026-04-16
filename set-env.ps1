# GitHub OAuth Environment Variables
# Copy this file to set-env.ps1 and replace the values with your actual GitHub OAuth app credentials

$env:GITHUB_CLIENT_ID = "Ov23lipGNQsjO5oFhS91"
$env:GITHUB_CLIENT_SECRET = "9057808c13ab3774b31a600dea377a2c87b50690"
$env:GITHUB_SCOPE = "user:email,repo"
$env:GITHUB_ORG_NAME = "esprithub"
$env:GITHUB_OAUTH_REDIRECT_URI = "http://https://esprithubfront-production.up.railway.app/auth/github/callback"
$env:FRONTEND_URL = "http://https://esprithubfront-production.up.railway.app"

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

# Never overwrite NVIDIA_API_KEY with an empty value.
# Keep the current shell value (or inherited environment value) if already set.

Write-Host "GitHub OAuth environment variables set!"
Write-Host "Client ID: $env:GITHUB_CLIENT_ID"
Write-Host "Client Secret: [HIDDEN]"
Write-Host "Scope: $env:GITHUB_SCOPE"
Write-Host "Organization: $env:GITHUB_ORG_NAME"
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
