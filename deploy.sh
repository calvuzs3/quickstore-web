#!/bin/bash

# ─── Configuration ────────────────────────────────────────────────────────────
# All sensitive vars live in $APP_DIR/.env.local on the server.
# Create it once manually — the script will source it automatically.

DOMAIN_NAME="quickstore-web.calvuz.net"
REPO_URL="https://github.com/calvuzs3/quickstore-web.git"
APP_DIR=~/quickstore-web
ENV_FILE="$APP_DIR/.env.local"

MODE=${1:-"update"}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Load .env.local ──────────────────────────────────────────────────────────

load_env() {
    if [ ! -f "$ENV_FILE" ]; then
        error ".env.local not found at $ENV_FILE — create it before running this script."
    fi
    set -a && source "$ENV_FILE" && set +a
    info ".env.local loaded."

    # Validate required vars
    [ -z "$KTOR_API_URL" ]    && error "KTOR_API_URL is not set in .env.local"
    [ -z "$SESSION_SECRET" ]  && error "SESSION_SECRET is not set in .env.local"
}

# ─── Install Docker ───────────────────────────────────────────────────────────

install_docker() {
    info "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl lsb-release \
        apt-transport-https software-properties-common
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg \
        -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
        https://download.docker.com/linux/debian \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
        sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    docker compose version || error "Docker Compose installation failed."
    info "Docker installed."
}

# ─── Git pull or clone ────────────────────────────────────────────────────────

pull_or_clone() {
    if [ -d "$APP_DIR/.git" ]; then
        info "Pulling latest changes..."
        cd "$APP_DIR" && git pull
    else
        info "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
    fi
}

# ─── Deploy ───────────────────────────────────────────────────────────────────

deploy() {
    cd "$APP_DIR" || error "Cannot enter $APP_DIR"

    load_env

    info "=== DOCKER DEPLOYMENT ==="

    info "Stopping existing container..."
    sudo docker compose down || true

    info "Removing stopped containers..."
    sudo docker container prune -f

    info "Building Docker image..."
    sudo docker compose build

    info "Starting container..."
    sudo docker compose up -d

    sleep 8

    if ! sudo docker ps | grep -q "quickstore-web"; then
        error "Container failed to start. Check: sudo docker compose logs"
    fi

    echo ""
    echo "=== RUNNING CONTAINERS ==="
    sudo docker ps

    echo ""
    echo "=== RECENT LOGS ==="
    sudo docker compose logs --tail=20

    echo ""
    info "Deployment complete."
    echo "  ✅ quickstore-web running on port 3002"
    echo "  ✅ Ktor backend: $KTOR_API_URL"
    echo "  🌐 NPM: $DOMAIN_NAME → $(hostname -I | awk '{print $1}'):3002"
    echo ""
    echo "=== TROUBLESHOOTING ==="
    echo "  Logs:    sudo docker compose logs -f"
    echo "  Restart: sudo docker compose restart"
    echo "  Rebuild: sudo docker compose build --no-cache && sudo docker compose up -d"
}

# ─── Entry point ──────────────────────────────────────────────────────────────

case "$MODE" in
    install)
        info "First-time install..."
        install_docker
        pull_or_clone
        deploy
        ;;
    update)
        info "Updating deployment..."
        pull_or_clone
        deploy
        ;;
    start)
        info "Starting existing build..."
        deploy
        ;;
    *)
        echo "Usage: $0 [install|update|start]"
        echo "  install — first deploy: installs Docker, clones repo"
        echo "  update  — pulls latest git changes and redeploys (default)"
        echo "  start   — redeploys without pulling git"
        exit 1
        ;;
esac
