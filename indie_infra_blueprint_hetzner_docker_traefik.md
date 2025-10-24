# Indie Infra Blueprint (Hetzner + Docker + Traefik)

A minimal, reproducible self-hosting stack for a .NET‑centric indie developer. Targets a single Hetzner VM (Ubuntu 24.04), Docker Compose, Traefik with automatic HTTPS, GitHub Actions CI/CD, and sane backups/monitoring.

---

## 0) Server bootstrap (once)

```bash
# On a fresh Ubuntu 24.04 VM
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Folders
sudo mkdir -p /opt/indie-infra/{reverse-proxy,apps,monitoring,backups}
sudo chown -R $USER:$USER /opt/indie-infra

# Optional: create an SSH deploy key and add the public key to GitHub secrets as DEPLOY_KEY
ssh-keygen -t ed25519 -C "deploy@indie-infra" -f ~/.ssh/indie_infra -N ""
```

> Tip: Use a Cloudflare free account for DNS. Point your domain’s A record at the VM’s public IP.

---

## 1) Repository layout

```
infra/
  .env.example
  docker-compose.yml
  reverse-proxy/
    traefik.yml            # static config
    dynamic/
      middleware.yml       # (optional) security headers, rate limits
    acme.json              # cert storage (created at runtime, chmod 600)
  apps/
    portfolio-web/
      Dockerfile
      nginx.conf
      public/index.html
  monitoring/
    docker-compose.monitoring.yml  # Dozzle + Uptime Kuma
  backups/
    backup.env.example
    backup.sh
  .github/
    workflows/
      build-and-deploy.yml
```

Commit this whole `infra/` folder to a private or public repo.

---

## 2) Environment file

Create `infra/.env` (copy from `.env.example`).

```dotenv
# domain + email for Let’s Encrypt
DOMAIN=yourdomain.tld
TRAEFIK_ACME_EMAIL=you@example.com

# image registry (GHCR recommended)
REGISTRY=ghcr.io
ORG_OR_USER=your-github-username
APP_NAME=portfolio-web
IMAGE_TAG=latest

# SSH deploy target
SSH_HOST=your.vm.ip.or.host
SSH_USER=ubuntu
SSH_PORT=22
SSH_KEY_PATH=~/.ssh/indie_infra
```

`.env.example` should contain the same keys with placeholder values.

---

## 3) Traefik (reverse proxy + TLS)

**infra/reverse-proxy/traefik.yml**

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    directory: "/etc/traefik/dynamic"
    watch: true

certificatesResolvers:
  le:
    acme:
      email: ${TRAEFIK_ACME_EMAIL}
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

api:
  dashboard: true
```

**infra/reverse-proxy/dynamic/middleware.yml** (optional but recommended)

```yaml
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        contentTypeNosniff: true
        referrerPolicy: no-referrer-when-downgrade
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
```

> After first run, ensure `acme.json` exists and has `chmod 600`.

---

## 4) App container (placeholder)

We’ll ship a minimal static site container as the landing page. Replace later with your .NET app image (same labels).

**infra/apps/portfolio-web/Dockerfile**

```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
```

**infra/apps/portfolio-web/nginx.conf**

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  location / {
    try_files $uri $uri/ /index.html =404;
  }
}
```

**infra/apps/portfolio-web/public/index.html**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio</title>
    <style>body{font:16px system-ui;margin:40px;max-width:720px}a{color:inherit}</style>
  </head>
  <body>
    <h1>Portfolio Root</h1>
    <p>Replace this with your real landing page or a .NET server container.</p>
  </body>
</html>
```

---

## 5) Core docker-compose

**infra/docker-compose.yml**

```yaml
version: "3.9"

name: indie-infra

networks:
  web:
    driver: bridge

volumes:
  letsencrypt:
  traefik-logs:

services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    command:
      - "--configFile=/etc/traefik/traefik.yml"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./reverse-proxy/traefik.yml:/etc/traefik/traefik.yml:ro"
      - "./reverse-proxy/dynamic:/etc/traefik/dynamic:ro"
      - "letsencrypt:/letsencrypt"
      - "traefik-logs:/var/log/traefik"
    networks:
      - web
    restart: unless-stopped

  portfolio-web:
    build:
      context: ./apps/portfolio-web
    image: ${REGISTRY}/${ORG_OR_USER}/${APP_NAME}:${IMAGE_TAG}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portfolio.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.portfolio.entrypoints=websecure"
      - "traefik.http.routers.portfolio.tls.certresolver=le"
      - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
      - "traefik.http.routers.portfolio.middlewares=security-headers@file"
    networks:
      - web
    restart: unless-stopped
```

> To swap in your .NET API later: push a container image and change the `build:` to `image: ghcr.io/you/your-api:tag` and expose its port with `labels: traefik.http.services.service.loadbalancer.server.port=8080` if not 80.

---

## 6) Monitoring (optional but useful)

**infra/monitoring/docker-compose.monitoring.yml**

```yaml
version: "3.9"

networks:
  web:
    external: false

services:
  dozzle:
    image: amir20/dozzle:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dozzle.rule=Host(`logs.${DOMAIN}`)"
      - "traefik.http.routers.dozzle.entrypoints=websecure"
      - "traefik.http.routers.dozzle.tls.certresolver=le"
    networks:
      - web
    restart: unless-stopped

  uptime-kuma:
    image: louislam/uptime-kuma:1
    volumes:
      - uptime-kuma:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kuma.rule=Host(`status.${DOMAIN}`)"
      - "traefik.http.routers.kuma.entrypoints=websecure"
      - "traefik.http.routers.kuma.tls.certresolver=le"
    networks:
      - web
    restart: unless-stopped

volumes:
  uptime-kuma:
```

Run with:

```bash
cd /opt/indie-infra
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

---

## 7) Backups with Restic

**infra/backups/backup.env.example**

```dotenv
# Restic repo (e.g., Backblaze B2 or Wasabi S3)
RESTIC_REPOSITORY=s3:https://s3.eu-central-1.wasabisys.com/your-bucket/indie-infra
RESTIC_PASSWORD=super-secret-long-password
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# What to back up
BACKUP_PATHS="/opt/indie-infra/apps /opt/indie-infra/reverse-proxy /var/lib/docker/volumes"
EXCLUDES="--exclude **/node_modules --exclude **/bin --exclude **/obj"
```

**infra/backups/backup.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/backup.env"

export RESTIC_REPOSITORY RESTIC_PASSWORD AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY

restic backup $EXCLUDES $BACKUP_PATHS
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
restic check
```

Install as a nightly cron:

```bash
crontab -e
# m h  dom mon dow   command
0 3 * * * /opt/indie-infra/backups/backup.sh >> /var/log/restic-backup.log 2>&1
```

> For PostgreSQL/MySQL, add a pre-backup dump step to `/opt/indie-infra/backups/backup.sh` and include the dump path in `BACKUP_PATHS`.

---

## 8) CI/CD (GitHub Actions → GHCR → SSH deploy)

**infra/.github/workflows/build-and-deploy.yml**

```yaml
name: build-and-deploy

on:
  push:
    branches: [ main ]
    paths:
      - 'infra/**'
      - '!infra/monitoring/**'

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: ./apps/portfolio-web
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/${{ vars.APP_NAME || 'portfolio-web' }}:latest

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT || '22' }}
          script: |
            set -e
            cd /opt/indie-infra
            # Refresh .env from repo vars if you prefer; otherwise manage .env manually on server
            docker compose pull
            docker compose up -d
```

**Required GitHub Secrets**

- `SSH_HOST`, `SSH_USER`, `SSH_PORT` (optional), `SSH_KEY` (private key content)

**Optional GitHub Variables**

- `APP_NAME` (defaults to `portfolio-web`)

> Alternative: Self-host a runner on the VM to avoid SSH; then the deploy step can be a local `docker compose up -d`.

---

## 9) Local → Server deploy (manual)

```bash
# first time on the server
cd /opt/indie-infra
cp infra/.env .env
# ensure acme storage permissions
[ -f reverse-proxy/acme.json ] || touch reverse-proxy/acme.json
chmod 600 reverse-proxy/acme.json

# bring up reverse proxy + app
docker compose up -d --build

# monitoring (optional)
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

Once DNS points to your VM and Traefik is running, certificates will be provisioned automatically. Visit `https://yourdomain.tld`.

---

## 10) Evolving to .NET services

When you’re ready to deploy a real .NET service (ASP.NET Core):

- Build a Dockerfile exposing `ASPNETCORE_URLS=http://0.0.0.0:8080`.
- Push the image to GHCR (or build on server).
- Add a service to `docker-compose.yml`:

```yaml
  api:
    image: ghcr.io/${ORG_OR_USER}/portfolio-api:latest
    environment:
      - ASPNETCORE_URLS=http://0.0.0.0:8080
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.${DOMAIN}`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=le"
      - "traefik.http.services.api.loadbalancer.server.port=8080"
    networks:
      - web
    restart: unless-stopped
```

Add Postgres if needed:

```yaml
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - web
    restart: unless-stopped

volumes:
  pgdata:
```

Back up `pgdata` via Restic as shown above (or use pg_dump in `backup.sh`).

---

## 11) Operational tips

- **Automated updates:** add Watchtower if you want nightly updates.
  ```yaml
  watchtower:
    image: containrrr/watchtower
    command: --schedule "0 0 3 * * *" --cleanup
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
  ```
- **Logs:** use Dozzle at `logs.yourdomain.tld`.
- **Status:** publish public checks from Uptime Kuma at `status.yourdomain.tld`.
- **Security:** fail2ban + keep kernel updated; disable password SSH; use SSH keys only.
- **Reproducibility:** script server bootstrap steps; keep `infra/` as the source of truth.

---

## 12) Cost and scaling

- Hetzner CX22 (€5–8/mo) comfortably serves a portfolio, blog, and a few demos.
- When you need more: bump the VM size or split services across two small VMs (reverse proxy + apps).
- If you outgrow Compose: migrate to k3s (reuse Traefik, keep DNS/CDN/Restic unchanged).

---

This gives you a fully open, cheap, and controllable base you can rebuild in a weekend and iterate on for years.

