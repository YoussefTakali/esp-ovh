#!/bin/bash

echo "=== Starting EspritHub Development Environment ==="

# Source environment variables
if [ -f "set-env.sh" ]; then
    echo "Loading GitHub OAuth environment variables..."
    source set-env.sh
else
    echo "❌ set-env.sh not found! Please create it with your GitHub OAuth credentials."
    echo "Use the template and replace with your actual values:"
    echo "export GITHUB_CLIENT_ID=\"your_actual_client_id\""
    echo "export GITHUB_CLIENT_SECRET=\"your_actual_client_secret\""
    exit 1
fi

# Check if environment variables are set
if [ -z "$GITHUB_CLIENT_ID" ] || [ "$GITHUB_CLIENT_ID" = "your_github_client_id_here" ]; then
    echo "❌ Please set your actual GITHUB_CLIENT_ID in set-env.sh"
    exit 1
fi

if [ -z "$GITHUB_CLIENT_SECRET" ] || [ "$GITHUB_CLIENT_SECRET" = "your_github_client_secret_here" ]; then
    echo "❌ Please set your actual GITHUB_CLIENT_SECRET in set-env.sh"
    exit 1
fi

echo "✅ GitHub OAuth credentials loaded successfully!"

# Fallback values for local development if not provided
export FRONTEND_URL="${FRONTEND_URL:-http://https://esprithubfront-production.up.railway.app}"
export GITHUB_OAUTH_REDIRECT_URI="${GITHUB_OAUTH_REDIRECT_URI:-${FRONTEND_URL%/}/auth/github/callback}"
echo "✅ OAuth Redirect URI: $GITHUB_OAUTH_REDIRECT_URI"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "🚀 Environment ready! Now start the applications:"
echo ""
echo "Backend (in this terminal):"
echo "cd server && ./mvnw spring-boot:run"
echo ""
echo "Frontend (in another terminal):"
echo "cd client && npm start"
echo ""
echo "Then open: http://https://esprithubfront-production.up.railway.app"
echo ""

# Ask if user wants to start backend now
read -p "Start the backend server now? (y/n): " START_BACKEND

if [ "$START_BACKEND" = "y" ] || [ "$START_BACKEND" = "Y" ]; then
    echo "Starting Spring Boot backend..."
    cd server
    export GITHUB_CLIENT_ID
    export GITHUB_CLIENT_SECRET
    export GITHUB_SCOPE
    export GITHUB_ORG_NAME
    export GITHUB_OAUTH_REDIRECT_URI
    export FRONTEND_URL
    ./mvnw spring-boot:run
fi
