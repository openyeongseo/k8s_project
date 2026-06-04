#!/bin/bash
cd ~/geunuk-compose
git pull
docker compose up -d --build
echo "⏳ 30초 대기 중..."
sleep 30
echo "===== Redis 캐시 초기화 ====="
docker exec geunuk-redis redis-cli FLUSHALL
echo "===== Auth 서비스 로그 ====="
docker logs geunuk-auth 2>&1 | grep -E "Started|ERROR" | tail -5
