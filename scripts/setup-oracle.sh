#!/bin/bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/eksl3910-star/pdf-converter.git}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/pdf-converter}"

echo "=== PDF Converter - Oracle Cloud Setup ==="

if ! command -v git >/dev/null 2>&1; then
  echo "[1/5] 시스템 패키지 설치..."
  sudo apt-get update
  sudo apt-get install -y git curl ca-certificates
else
  echo "[1/5] git 확인됨"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[2/5] Docker 설치..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" 2>/dev/null || true
  if ! groups | grep -q docker; then
    echo "Docker 그룹 적용을 위해 재접속이 필요할 수 있습니다."
    echo "아래 명령이 permission denied 이면: newgrp docker"
  fi
else
  echo "[2/5] Docker 확인됨"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin 확인 중..."
  sudo apt-get install -y docker-compose-plugin 2>/dev/null || true
fi

echo "[3/5] 코드 받기..."
if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR"
  git pull --ff-only || true
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

if [ ! -f .env ]; then
  echo "[4/5] .env 생성..."
  cp .env.example .env
  echo ""
  echo "  (선택) 비밀번호 설정: nano .env → SITE_PASSWORD=..."
else
  echo "[4/5] .env 이미 있음"
fi

echo "[5/5] Docker 빌드 및 실행 (15~25분 소요)..."
docker compose -f docker-compose.oracle.yml up -d --build

PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || curl -s --max-time 5 icanhazip.com 2>/dev/null || echo "서버공인IP")

echo ""
echo "============================================"
echo "  설치 완료!"
echo ""
echo "  접속: http://${PUBLIC_IP}:7860"
echo ""
echo "  로그:  cd $INSTALL_DIR && docker compose -f docker-compose.oracle.yml logs -f"
echo "  중지:  docker compose -f docker-compose.oracle.yml down"
echo ""
echo "  도메인 연결: ORACLE_DEPLOY.md 참고"
echo "============================================"
