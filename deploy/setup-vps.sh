#!/usr/bin/env bash
# Prepara uma VPS Ubuntu 24.04 do zero para rodar os apps (instalação leve).
# Uso, a partir do seu computador (na pasta do projeto):
#   scp -i CHAVE.pem -r deploy ubuntu@IP:~/
#   ssh -i CHAVE.pem ubuntu@IP "sudo bash ~/deploy/setup-vps.sh"
# Pode rodar de novo sem problema (não duplica nada).
set -euo pipefail

APP_DIR=/opt/apps
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_USER="${SUDO_USER:-ubuntu}"

echo "==> Fuso horário UTC (os crons estão em UTC)"
timedatectl set-timezone UTC

echo "==> Atualizando o sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl ufw cron unattended-upgrades

echo "==> Swap de 2 GB (folga para a VPS de 2 GB de RAM)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -w vm.swappiness=10 >/dev/null
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf

echo "==> Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker "$DEPLOY_USER"
systemctl enable --now docker

echo "==> Firewall: só SSH, HTTP e HTTPS"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> Arquivos em $APP_DIR"
mkdir -p "$APP_DIR"
cp "$SRC_DIR/docker-compose.yml" "$SRC_DIR/Caddyfile" "$APP_DIR/"
if [ ! -f "$APP_DIR/topsites.env" ]; then
  cp "$SRC_DIR/topsites.env.example" "$APP_DIR/topsites.env"
fi
chmod 600 "$APP_DIR/topsites.env"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

echo "==> Crons"
cp "$SRC_DIR/crontab" /etc/cron.d/apps
chmod 644 /etc/cron.d/apps
systemctl enable --now cron

echo
echo "Pronto. Falta:"
echo "  1. Preencher $APP_DIR/topsites.env  (nano $APP_DIR/topsites.env)"
echo "  2. Rodar o workflow 'Build e deploy' no GitHub (ele faz login no GHCR, baixa e sobe)"
echo "  3. Apontar o DNS para o IP desta VPS"
