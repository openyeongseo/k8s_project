#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

W=75

line() { printf "${CYAN}%${W}s${NC}\n" | tr ' ' '='; }

banner() {
  echo ""
  line
  printf "${CYAN}${BOLD}  %s${NC}\n" "$1"
  line
  echo ""
  sleep 1
}

spinner_check() {
  # $1 = SA, $2 = secret, $3 = label
  local pod=$1
  local secret=$2
  printf "  ${DIM}checking...${NC}"
  sleep 0.4
  printf "\r"
  if kubectl exec "$pod" -n healthshop -- kubectl get secret "$secret" -n healthshop >/dev/null 2>&1; then
    echo -e "  ${GREEN}${BOLD}✔ ALLOWED${NC}"
    return 0
  else
    echo -e "  ${RED}${BOLD}✘ FORBIDDEN${NC}"
    return 1
  fi
}

clear
echo -e "${MAGENTA}${BOLD}"
cat << "BANNER"
   ____  ____    _    ____    ____                       
  |  _ \| __ )  / \  / ___|  |  _ \  ___ _ __ ___   ___  
  | |_) |  _ \ / _ \| |      | | | |/ _ \ '_ ` _ \ / _ \ 
  |  _ <| |_) / ___ \ |___   | |_| |  __/ | | | | | (_) |
  |_| \_\____/_/   \_\____|  |____/ \___|_| |_| |_|\___/ 
BANNER
echo -e "${NC}"
sleep 1

banner "근육캐치 RBAC 데모 :: ServiceAccount 기반 최소 권한 제어"

echo -e "${BOLD}구성${NC}"
echo -e "  ${CYAN}Secrets${NC}"
echo -e "    • mariadb-credentials   (MariaDB 접속정보 — root / mariadb123)"
echo -e "    • mongodb-credentials   (MongoDB 접속정보 — bodyx_writer / writer-pass-1234)"
echo ""
echo -e "  ${CYAN}ServiceAccounts${NC}"
echo -e "    • order-service-sa   → MariaDB 사용 (주문)"
echo -e "    • review-service-sa  → MongoDB 사용 (리뷰)"
echo -e "    • cart-service-sa    → Redis 전용, 둘 다 사용 안 함"
sleep 2

# ── PART 1: cart-service-sa baseline ──
banner "PART 1. cart-service-sa (Redis 전용) — RBAC 미부여 ServiceAccount"

echo -e "${BOLD}1-1) mariadb-credentials 조회 시도${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-cart -- kubectl get secret mariadb-credentials${NC}"
spinner_check rbac-demo-cart mariadb-credentials

echo ""
echo -e "${BOLD}1-2) mongodb-credentials 조회 시도${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-cart -- kubectl get secret mongodb-credentials${NC}"
spinner_check rbac-demo-cart mongodb-credentials

echo ""
echo -e "${RED}>>> cart-service-sa는 어떤 DB 자격증명도 조회할 수 없음 (least privilege)${NC}"
sleep 2

# ── PART 2: order-service-sa ──
banner "PART 2. order-service-sa (MariaDB 사용) — RoleBinding: mariadb-secret-reader"

echo -e "${BOLD}2-1) mariadb-credentials 조회 시도 ${DIM}(자기 영역)${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-order -- kubectl get secret mariadb-credentials${NC}"
spinner_check rbac-demo-order mariadb-credentials

echo ""
echo -e "${BOLD}2-2) mongodb-credentials 조회 시도 ${DIM}(다른 서비스 영역)${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-order -- kubectl get secret mongodb-credentials${NC}"
spinner_check rbac-demo-order mongodb-credentials

echo ""
echo -e "${GREEN}>>> order-service는 자신의 DB(MariaDB)만 접근 가능, review의 MongoDB는 접근 불가${NC}"
sleep 2

# ── PART 3: review-service-sa ──
banner "PART 3. review-service-sa (MongoDB 사용) — RoleBinding: mongodb-secret-reader"

echo -e "${BOLD}3-1) mariadb-credentials 조회 시도 ${DIM}(다른 서비스 영역)${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-review -- kubectl get secret mariadb-credentials${NC}"
spinner_check rbac-demo-review mariadb-credentials

echo ""
echo -e "${BOLD}3-2) mongodb-credentials 조회 시도 ${DIM}(자기 영역)${NC}"
echo -e "${YELLOW}\$ kubectl exec rbac-demo-review -- kubectl get secret mongodb-credentials${NC}"
spinner_check rbac-demo-review mongodb-credentials

echo ""
echo -e "${GREEN}>>> review-service는 자신의 DB(MongoDB)만 접근 가능, order의 MariaDB는 접근 불가${NC}"
sleep 2

# ── PART 4: 실제 값 디코딩 (자기 영역만) ──
banner "PART 4. 권한이 있는 경우 — Secret 디코딩 → 실제 접속정보 획득"

M_USER=$(kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mariadb-credentials -n healthshop -o jsonpath='{.data.username}' | base64 -d)
M_PASS=$(kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mariadb-credentials -n healthshop -o jsonpath='{.data.password}' | base64 -d)
G_USER=$(kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mongodb-credentials -n healthshop -o jsonpath='{.data.username}' | base64 -d)
G_PASS=$(kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mongodb-credentials -n healthshop -o jsonpath='{.data.password}' | base64 -d)

echo -e "${BOLD}[order-service-sa] → mariadb-credentials${NC}"
echo -e "    username: ${GREEN}${M_USER}${NC}"
echo -e "    password: ${GREEN}${M_PASS}${NC}"
echo ""
echo -e "${BOLD}[review-service-sa] → mongodb-credentials${NC}"
echo -e "    username: ${GREEN}${G_USER}${NC}"
echo -e "    password: ${GREEN}${G_PASS}${NC}"
sleep 2

# ── 최종 매트릭스 ──
banner "최종 권한 매트릭스 (RBAC Access Matrix)"

printf "  ${BOLD}%-22s | %-22s | %-22s${NC}\n" "ServiceAccount" "mariadb-credentials" "mongodb-credentials"
printf "  %-22s-+-%-22s-+-%-22s\n" "----------------------" "----------------------" "----------------------" | tr ' ' '-'
printf "  %-22s | ${RED}%-22s${NC} | ${RED}%-22s${NC}\n" "cart-service-sa"   "Forbidden" "Forbidden"
printf "  %-22s | ${GREEN}%-22s${NC} | ${RED}%-22s${NC}\n"   "order-service-sa"  "Allowed"   "Forbidden"
printf "  %-22s | ${RED}%-22s${NC} | ${GREEN}%-22s${NC}\n"   "review-service-sa" "Forbidden" "Allowed"
echo ""

echo -e "${BOLD}${CYAN}핵심 메시지${NC}"
echo "  Kubernetes RBAC은 기본적으로 모든 접근을 차단(deny-all)하며,"
echo "  RoleBinding으로 명시한 리소스에만 접근을 허용한다."
echo "  → 각 마이크로서비스는 자신의 DB 자격증명만 조회할 수 있고,"
echo "    다른 서비스의 자격증명에는 접근할 수 없다 (Least Privilege)."
echo "  → 한 서비스가 침해되어도 다른 서비스의 DB 정보는 노출되지 않는다."
echo ""
line
echo ""

# ── PART 5: 휴먼 RBAC (팀원별 역할 기반 권한) ──
banner "PART 5. 팀원별 역할 기반 권한 (Human RBAC)"

echo -e "${BOLD}역할 분담${NC}"
echo -e "  • ${CYAN}정은${NC} — DB/Redis/Kafka + Secret·ConfigMap 관리"
echo -e "  • ${CYAN}영서${NC} — FE/CI-CD + Deployment 배포 관리"
sleep 1

check_auth() {
  # $1=설명 $2=verb $3=resource $4=user $5=namespace $6=기대값
  local result=$(kubectl auth can-i "$2" "$3" --as="$4" -n "$5" 2>/dev/null)
  echo -ne "  $1 ... "
  if [ "$result" == "yes" ]; then
    echo -e "${GREEN}${BOLD}YES${NC}"
  else
    echo -e "${RED}${BOLD}NO${NC}"
  fi
  sleep 0.3
}

echo ""
echo -e "${BOLD}[정은] — Secret/ConfigMap 관리자${NC}"
check_auth "healthshop Secret(mariadb-credentials) 조회" get secret/mariadb-credentials jeongeun healthshop
check_auth "healthshop ConfigMap 수정"                     update configmap jeongeun healthshop
check_auth "healthshop Deployment(order-service) 수정"     update deployment/order-service jeongeun healthshop
check_auth "database 네임스페이스 Pod 삭제"                 delete pod jeongeun database

echo ""
echo -e "${BOLD}[영서] — CI/CD 배포 담당${NC}"
check_auth "healthshop Deployment(order-service) 수정"     update deployment/order-service yeongseo healthshop
check_auth "healthshop Secret(mariadb-credentials) 조회"   get secret/mariadb-credentials yeongseo healthshop
check_auth "database 네임스페이스 Pod 조회"                 get pod yeongseo database

echo ""
echo -e "${BOLD}${CYAN}핵심 메시지${NC}"
echo "  같은 healthshop 네임스페이스 안에서도 역할에 따라 권한이 분리된다."
echo "    • 정은(DB/Secret 관리자)  → Secret·ConfigMap 변경 가능, 배포(Deployment)는 불가"
echo "    • 영서(CI/CD 배포 담당)   → Deployment 배포/재시작 가능, Secret 조회는 불가"
echo "  팀원 각자의 책임 범위에 맞게 클러스터 권한도 최소화된다."
echo ""
line
echo ""
