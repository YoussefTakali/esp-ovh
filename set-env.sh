# GitHub OAuth Environment Variables
# Copy this file to set-env.sh and replace the values with your actual GitHub OAuth app credentials

export GITHUB_CLIENT_ID="Ov23lipGNQsjO5oFhS91"
export GITHUB_CLIENT_SECRET="9057808c13ab3774b31a600dea377a2c87b50690"
export GITHUB_SCOPE="user:email,repo"
export GITHUB_ORG_NAME="esprithub"
export FRONTEND_URL="https://esprithub.app"
export APP_CORS_ALLOWED_ORIGINS="https://esprithub.app,https://www.esprithub.app"
export GITHUB_OAUTH_REDIRECT_URI="https://esprithub.app/auth/github/callback"

# Local Docker Postgres database
export DOCKER_DB_HOST="localhost"
export DOCKER_DB_PORT="5433"
export DOCKER_DB_NAME="esprithub"
export DOCKER_DB_USER="esprithub_user"
export DOCKER_DB_PASSWORD="esprithub_password"
export SPRING_DATASOURCE_URL="jdbc:postgresql://${DOCKER_DB_HOST}:${DOCKER_DB_PORT}/${DOCKER_DB_NAME}"
export SPRING_DATASOURCE_USERNAME="${DOCKER_DB_USER}"
export SPRING_DATASOURCE_PASSWORD="${DOCKER_DB_PASSWORD}"

# AI provider (NVIDIA OpenAI-compatible endpoint)
export AI_BASE_URL="https://integrate.api.nvidia.com/v1"
export AI_MODEL="minimaxai/minimax-m2.7"
export NVIDIA_API_KEY="${NVIDIA_API_KEY:-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}"

# Optional key aliases:
# - AI_PROVIDER_API_KEY (recommended generic name)
# - OPENAI_API_KEY (legacy fallback)
if [ -z "${NVIDIA_API_KEY:-}" ] && [ -n "${AI_PROVIDER_API_KEY:-}" ]; then
	export NVIDIA_API_KEY="${AI_PROVIDER_API_KEY}"
fi

if [ -z "${NVIDIA_API_KEY:-}" ] && [ -n "${OPENAI_API_KEY:-}" ]; then
	export NVIDIA_API_KEY="${OPENAI_API_KEY}"
fi

# Never overwrite NVIDIA_API_KEY with an empty value.
# Keep the current shell value (or inherited environment value) if already set.

echo "GitHub OAuth environment variables set!"
echo "Client ID: $GITHUB_CLIENT_ID"
echo "Client Secret: [HIDDEN]"
echo "Scope: $GITHUB_SCOPE"
echo "Organization: $GITHUB_ORG_NAME"
echo "Frontend URL: $FRONTEND_URL"
echo "CORS Origins: $APP_CORS_ALLOWED_ORIGINS"
echo "OAuth Redirect URI: $GITHUB_OAUTH_REDIRECT_URI"
echo "Datasource URL: $SPRING_DATASOURCE_URL"
echo "Datasource Username: $SPRING_DATASOURCE_USERNAME"

echo "Datasource Password: [HIDDEN]"

echo "AI Base URL: $AI_BASE_URL"
echo "AI Model: $AI_MODEL"

if [ -z "${NVIDIA_API_KEY:-}" ]; then
	echo "WARNING: NVIDIA_API_KEY is not set. Export it before starting backend."
else
	echo "NVIDIA API Key: [HIDDEN]"
fi
