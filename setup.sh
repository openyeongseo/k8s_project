#!/bin/bash
# ─────────────────────────────────────────────────────
#  근육캐치 로컬 환경 셋업 스크립트
#  실행: chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────

set -e
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  근육캐치 로컬 환경 셋업 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_DIR="/home/kevin"
COMPOSE_DIR="$BASE_DIR/geunuk-compose"

# 1. compose 디렉토리 생성
mkdir -p "$COMPOSE_DIR/nginx"
mkdir -p "$COMPOSE_DIR/init-db"

echo "[1/4] 서비스 zip 압축 해제 중..."

# BE 서비스 압축 해제
for service in auth product cart order point review; do
    ZIP="$BASE_DIR/${service}-service.zip"
    if [ -f "$ZIP" ]; then
        echo "  ✓ ${service}-service 압축 해제"
        unzip -q -o "$ZIP" -d "$COMPOSE_DIR/"
    else
        echo "  ✗ ${service}-service.zip 없음 - 건너뜀"
    fi
done

# FE 복사
if [ -d "$BASE_DIR/geunuk-frontend" ]; then
    echo "  ✓ geunuk-frontend 복사"
    cp -r "$BASE_DIR/geunuk-frontend" "$COMPOSE_DIR/"
fi

echo ""
echo "[2/4] application.yml ddl-auto 수정 (validate → update)..."

for service in auth product cart order point review; do
    YML="$COMPOSE_DIR/${service}-service/src/main/resources/application.yml"
    if [ -f "$YML" ]; then
        sed -i 's/ddl-auto: validate/ddl-auto: update/g' "$YML"
        echo "  ✓ ${service}-service application.yml 수정"
    fi
done

echo ""
echo "[3/4] docker compose 설정 파일 복사..."
# docker-compose.yml, nginx.conf, init SQL은 이미 이 스크립트와 같은 위치에 있다고 가정
cp "$BASE_DIR/geunuk-compose/docker-compose.yml" "$COMPOSE_DIR/" 2>/dev/null || true
cp "$BASE_DIR/geunuk-compose/nginx/nginx.conf" "$COMPOSE_DIR/nginx/" 2>/dev/null || true
cp "$BASE_DIR/geunuk-compose/init-db/01_init.sql" "$COMPOSE_DIR/init-db/" 2>/dev/null || true

echo ""
echo "[4/4] docker compose 실행..."
cd "$COMPOSE_DIR"
docker compose up --build -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  실행 완료!"
echo ""
echo "  FE   → http://192.168.56.104:3000"
echo "  API  → http://192.168.56.104:8080"
echo "  Auth → http://192.168.56.104:8081/swagger-ui.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
