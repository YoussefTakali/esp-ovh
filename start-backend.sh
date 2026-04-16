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

echo "👤 Admin bootstrap seeding enabled: ${BOOTSTRAP_ADMIN_EMAIL}"
echo "🔐 Admin bootstrap password: [HIDDEN]"

# Display the variables (hide secret)
echo "📋 GitHub OAuth Configuration:"
echo "   Client ID: ${GITHUB_CLIENT_ID:-'NOT SET'}"
echo "   Client Secret: ${GITHUB_CLIENT_SECRET:+[HIDDEN]}"
echo "   Scope: ${GITHUB_SCOPE:-'NOT SET'}"
echo "   Organization: ${GITHUB_ORG_NAME:-'NOT SET'}"

# Start the backend
echo "🌱 Starting Spring Boot application..."
cd server
export GITHUB_CLIENT_ID
export GITHUB_CLIENT_SECRET
export GITHUB_SCOPE
export GITHUB_ORG_NAME
export BOOTSTRAP_ADMIN_EMAIL
export BOOTSTRAP_ADMIN_PASSWORD
./mvnw spring-boot:run
