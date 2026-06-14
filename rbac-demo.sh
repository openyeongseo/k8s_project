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

policy() {
  echo -e "${BOLD}[정책 확인]${NC} $1"
  echo -e "${YELLOW}\$ $2${NC}"
  eval "$2" | python3 -m json.tool 2>/dev/null | sed 's/^/    /'
  echo ""
}

run() {
  echo -e "${BOLD}[명령 실행]${NC} $1"
  echo -e "${YELLOW}\$ $2${NC}"
  echo ""
  eval "$2" 2>&1 | sed 's/^/    /'
  echo ""
}

interpret() {
  echo -e "${BOLD}[해석]${NC} $1"
  sleep 1
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

banner "근육캐치 RBAC 데모 :: 정책(Policy) → 실행(Command) → 결과(Result) → 해석"

echo -e "${BOLD}이 데모의 진행 방식${NC}"
echo "  1) 정책 확인  — 실제 Role/RoleBinding에 정의된 권한 규칙을 그대로 조회"
echo "  2) 명령 실행  — 해당 ServiceAccount/User로 실제 kubectl 명령 실행, 가공 없는 출력"
echo "  3) 해석       — 정책의 어느 규칙 때문에 그 결과가 나왔는지 연결"
sleep 2

echo ""
echo -e "${BOLD}구성${NC}"
echo -e "  Secrets: mariadb-credentials(MariaDB), mongodb-credentials(MongoDB)"
echo -e "  ServiceAccounts: cart-service-sa(권한없음), order-service-sa(MariaDB), review-service-sa(MongoDB)"
sleep 2

# =====================================================
# PART 1. cart-service-sa
# =====================================================
banner "PART 1. cart-service-sa (Redis 전용) — RoleBinding 없음"

policy "healthshop의 모든 RoleBinding과 그 대상(subject) 목록" \
  "kubectl get rolebinding -n healthshop -o jsonpath='{range .items[*]}{\"{\\\"binding\\\":\\\"\"}{.metadata.name}{\"\\\", \\\"subject\\\":\\\"\"}{.subjects[0].name}{\"\\\"}\n\"}{end}'"

echo -e "${RED}>>> 위 목록에 'cart-service-sa'는 어디에도 없음 — 어떤 RoleBinding도 연결되지 않음${NC}"
echo -e "${RED}>>> K8s RBAC 기본 정책: 명시적으로 허용되지 않은 요청은 전부 거부(deny-all)${NC}"
sleep 2

run "1-1) mariadb-credentials 조회 시도" \
  "kubectl exec rbac-demo-cart -n healthshop -- kubectl get secret mariadb-credentials -n healthshop"

interpret "에러 메시지의 'User \"system:serviceaccount:healthshop:cart-service-sa\" cannot get resource \"secrets\"' 부분을 보면 — 이 신원에게 secrets에 대한 어떤 권한도 부여되어 있지 않음을 API 서버가 직접 알려주고 있음"

run "1-2) mongodb-credentials 조회 시도" \
  "kubectl exec rbac-demo-cart -n healthshop -- kubectl get secret mongodb-credentials -n healthshop"

interpret "동일한 이유로 Forbidden — RoleBinding이 없으니 어떤 Secret 이름이든 결과는 같음"
sleep 1

# =====================================================
# PART 2. order-service-sa
# =====================================================
banner "PART 2. order-service-sa (MariaDB 사용) — RoleBinding: order-service-mariadb-access"

policy "order-service-sa에 연결된 Role(mariadb-secret-reader)의 rule" \
  "kubectl get role mariadb-secret-reader -n healthshop -o jsonpath='{.rules}'"

echo -e "${CYAN}>>> resources=secrets, resourceNames=[mariadb-credentials], verbs=[get]${NC}"
echo -e "${CYAN}>>> 즉 '오직 mariadb-credentials 라는 이름의 Secret에 대해서만 get 가능'${NC}"
sleep 2

run "2-1) mariadb-credentials 조회 시도 (정책에 명시된 리소스)" \
  "kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mariadb-credentials -n healthshop"

interpret "위 정책의 resourceNames와 요청한 Secret 이름이 정확히 일치 → Allowed"

run "2-2) mongodb-credentials 조회 시도 (정책에 없는 리소스)" \
  "kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mongodb-credentials -n healthshop"

interpret "order-service-sa는 Role을 가지고 있지만, 그 Role의 resourceNames에 'mongodb-credentials'는 없음 → Forbidden. RBAC은 '서비스 단위'가 아니라 '리소스 이름 단위'까지 정밀하게 제어함"
sleep 1

# =====================================================
# PART 3. review-service-sa
# =====================================================
banner "PART 3. review-service-sa (MongoDB 사용) — RoleBinding: review-service-mongodb-access"

policy "review-service-sa에 연결된 Role(mongodb-secret-reader)의 rule" \
  "kubectl get role mongodb-secret-reader -n healthshop -o jsonpath='{.rules}'"

echo -e "${CYAN}>>> resources=secrets, resourceNames=[mongodb-credentials], verbs=[get]${NC}"
sleep 2

run "3-1) mariadb-credentials 조회 시도 (정책에 없는 리소스)" \
  "kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mariadb-credentials -n healthshop"

interpret "review-service-sa의 Role에는 'mariadb-credentials'가 없음 → Forbidden"

run "3-2) mongodb-credentials 조회 시도 (정책에 명시된 리소스)" \
  "kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mongodb-credentials -n healthshop"

interpret "정책의 resourceNames와 일치 → Allowed. order-service-sa와 review-service-sa는 정확히 반대의 권한을 가짐 (서로의 DB 자격증명은 볼 수 없음)"
sleep 1

# =====================================================
# PART 4. Secret 디코딩
# =====================================================
banner "PART 4. 권한이 있는 경우 — Secret 디코딩 → 실제 접속정보 획득"

run "[order-service-sa] mariadb-credentials → username 디코딩" \
  "kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mariadb-credentials -n healthshop -o jsonpath='{.data.username}' | base64 -d && echo"

run "[order-service-sa] mariadb-credentials → password 디코딩" \
  "kubectl exec rbac-demo-order -n healthshop -- kubectl get secret mariadb-credentials -n healthshop -o jsonpath='{.data.password}' | base64 -d && echo"

run "[review-service-sa] mongodb-credentials → username 디코딩" \
  "kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mongodb-credentials -n healthshop -o jsonpath='{.data.username}' | base64 -d && echo"

run "[review-service-sa] mongodb-credentials → password 디코딩" \
  "kubectl exec rbac-demo-review -n healthshop -- kubectl get secret mongodb-credentials -n healthshop -o jsonpath='{.data.password}' | base64 -d && echo"

interpret "'Secret 조회 권한이 있다' = '실제 DB 접속정보를 얻을 수 있다' = '해당 DB에 접근할 수 있다'. PART1~3의 Forbidden/Allowed가 곧 'DB 접근 가능 여부'와 직결됨"
sleep 1

# =====================================================
# PART 5. 휴먼 RBAC
# =====================================================
banner "PART 5. 팀원별 역할 기반 권한 (Human RBAC)"

echo -e "${BOLD}역할 분담${NC}"
echo "  정은 — DB/Redis/Kafka + Secret·ConfigMap 관리"
echo "  영서 — FE/CI-CD + Deployment 배포 관리"
sleep 1

policy "정은(jeongeun)에게 연결된 Role(secret-configmap-manager)의 rule" \
  "kubectl get role secret-configmap-manager -n healthshop -o jsonpath='{.rules}'"

echo -e "${CYAN}>>> resources=[secrets, configmaps] 만 포함, deployments는 없음${NC}"
sleep 2

run "5-1) [정은] healthshop Secret(mariadb-credentials) 조회" \
  "kubectl auth can-i get secret/mariadb-credentials --as=jeongeun -n healthshop"
interpret "위 정책에 secrets get 권한 있음 → yes"

run "5-2) [정은] healthshop Deployment(order-service) 수정" \
  "kubectl auth can-i update deployment/order-service --as=jeongeun -n healthshop"
interpret "위 정책에 deployments 관련 권한이 전혀 없음 → no"
sleep 1

policy "영서(yeongseo)에게 연결된 Role(deployment-manager)의 rule" \
  "kubectl get role deployment-manager -n healthshop -o jsonpath='{.rules}'"

echo -e "${CYAN}>>> resources=[deployments, pods] 만 포함, secrets/configmaps는 없음${NC}"
sleep 2

run "5-3) [영서] healthshop Deployment(order-service) 수정" \
  "kubectl auth can-i update deployment/order-service --as=yeongseo -n healthshop"
interpret "위 정책에 deployments update 권한 있음 → yes"

run "5-4) [영서] healthshop Secret(mariadb-credentials) 조회" \
  "kubectl auth can-i get secret/mariadb-credentials --as=yeongseo -n healthshop"
interpret "위 정책에 secrets 관련 권한이 전혀 없음 → no. 정은과 영서는 같은 네임스페이스 안에서 정확히 반대 영역의 권한을 가짐"
sleep 1

# =====================================================
# 최종 요약
# =====================================================
banner "최종 요약"

printf "  ${BOLD}%-22s | %-22s | %-22s${NC}\n" "ServiceAccount" "mariadb-credentials" "mongodb-credentials"
printf "  %s\n" "------------------------+------------------------+------------------------"
printf "  %-22s | ${RED}%-22s${NC} | ${RED}%-22s${NC}\n" "cart-service-sa"   "Forbidden" "Forbidden"
printf "  %-22s | ${GREEN}%-22s${NC} | ${RED}%-22s${NC}\n"   "order-service-sa"  "Allowed"   "Forbidden"
printf "  %-22s | ${RED}%-22s${NC} | ${GREEN}%-22s${NC}\n"   "review-service-sa" "Forbidden" "Allowed"
echo ""
printf "  ${BOLD}%-22s | %-22s | %-22s${NC}\n" "User" "Secret/ConfigMap" "Deployment"
printf "  %s\n" "------------------------+------------------------+------------------------"
printf "  %-22s | ${GREEN}%-22s${NC} | ${RED}%-22s${NC}\n" "jeongeun" "Allowed" "Forbidden"
printf "  %-22s | ${RED}%-22s${NC} | ${GREEN}%-22s${NC}\n" "yeongseo" "Forbidden" "Allowed"
echo ""

echo -e "${BOLD}${CYAN}핵심 메시지${NC}"
echo "  모든 결과는 Role에 정의된 rule(resources/resourceNames/verbs)에서 직접 도출됨."
echo "  RBAC은 추상적인 '권한'이 아니라, 위에서 조회한 것과 같은 구체적인 규칙의 집합이며,"
echo "  K8s API 서버는 매 요청마다 이 규칙을 평가해 deny-all 기본값에 예외를 허용한다."
echo ""
line
echo ""
