#!/bin/bash

# EspritHub Backend Startup Script
echo "🚀 Starting EspritHub Backend..."
echo ""
echo "🔑 ======== ADMIN CREDENTIALS ========"
echo "📧 Email: Youssef.Takali@esprit.tn"
echo "🔐 Password: youssef123"
echo "👑 Role: ADMIN"
echo "====================================="
echo ""

# Load environment variables from .env file
if [ -f "server/.env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(grep -v '^#' server/.env | xargs)
    echo "✅ Environment variables loaded!"
else
    echo "⚠️  .env file not found, trying set-env.sh..."
    if [ -f "set-env.sh" ]; then
        source set-env.sh
    else
        echo "❌ No environment configuration found!"
        exit 1
    fi
fi

# Ensure admin bootstrap values exist for automatic seeding.
export BOOTSTRAP_ADMIN_EMAIL="${BOOTSTRAP_ADMIN_EMAIL:-Youssef.Takali@esprit.tn}"
export BOOTSTRAP_ADMIN_PASSWORD="${BOOTSTRAP_ADMIN_PASSWORD:-youssef123}"

# Normalize CORS variable naming for production setup.
if [ -n "${CORS_ALLOWED_ORIGINS:-}" ] && [ -z "${APP_CORS_ALLOWED_ORIGINS:-}" ]; then
    export APP_CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS}"
fi

# Domain defaults for production runtime.
export FRONTEND_URL="${FRONTEND_URL:-https://esprithub.app}"
export APP_CORS_ALLOWED_ORIGINS="${APP_CORS_ALLOWED_ORIGINS:-https://esprithub.app,https://www.esprithub.app}"
export GITHUB_OAUTH_REDIRECT_URI="${GITHUB_OAUTH_REDIRECT_URI:-${FRONTEND_URL%/}/auth/github/callback}"

# Normalize a common misconfiguration where callback is set to backend path.
if [ "${GITHUB_OAUTH_REDIRECT_URI}" = "${FRONTEND_URL%/}/api/v1/github/callback" ]; then
    export GITHUB_OAUTH_REDIRECT_URI="${FRONTEND_URL%/}/auth/github/callback"
fi

echo "👤 Admin bootstrap seeding enabled: ${BOOTSTRAP_ADMIN_EMAIL}"
echo "🔐 Admin bootstrap password: [HIDDEN]"

# Display the variables (hide secret)
echo "📋 GitHub OAuth Configuration:"
echo "   Client ID: ${GITHUB_CLIENT_ID:-'NOT SET'}"
echo "   Client Secret: ${GITHUB_CLIENT_SECRET:+[HIDDEN]}"
echo "   Scope: ${GITHUB_SCOPE:-'NOT SET'}"
echo "   Organization: ${GITHUB_ORG_NAME:-'NOT SET'}"
echo "   Frontend URL: ${FRONTEND_URL}"
echo "   CORS Origins: ${APP_CORS_ALLOWED_ORIGINS}"
echo "   OAuth Redirect URI: ${GITHUB_OAUTH_REDIRECT_URI}"

# Start the backend
echo "🌱 Starting Spring Boot application..."
cd server
export GITHUB_CLIENT_ID
export GITHUB_CLIENT_SECRET
export GITHUB_SCOPE
export GITHUB_ORG_NAME
export FRONTEND_URL
export APP_CORS_ALLOWED_ORIGINS
export GITHUB_OAUTH_REDIRECT_URI
export BOOTSTRAP_ADMIN_EMAIL
export BOOTSTRAP_ADMIN_PASSWORD
./mvnw spring-boot:run
