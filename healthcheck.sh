#!/bin/bash

# NetSecure 다중 지침서 분석기 헬스체크 스크립트
# Docker 컨테이너의 상태를 확인하는 스크립트

set -e

# 설정 변수
HEALTH_CHECK_URL="http://localhost:3000/health"
API_CHECK_URL="https://kisa-network-analyzer-production.up.railway.app/api/v1/health"
TIMEOUT=10
MAX_RETRIES=3
RETRY_DELAY=2

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# HTTP 상태 코드 확인 함수
check_http_status() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-$TIMEOUT}
    
    log_info "Checking $url..."
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time $timeout \
        --connect-timeout 5 \
        "$url" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        log_info "✓ $url returned $status_code"
        return 0
    else
        log_error "✗ $url returned $status_code (expected $expected_status)"
        return 1
    fi
}

# JSON 응답 확인 함수
check_json_response() {
    local url=$1
    local timeout=${2:-$TIMEOUT}
    
    log_info "Checking JSON response from $url..."
    
    local response
    response=$(curl -s --max-time $timeout --connect-timeout 5 "$url" 2>/dev/null || echo "")
    
    if [ -z "$response" ]; then
        log_error "✗ No response from $url"
        return 1
    fi
    
    # JSON 유효성 검사
    if echo "$response" | python3 -m json.tool >/dev/null 2>&1; then
        log_info "✓ Valid JSON response received"
        
        # 상태 필드 확인
        local status
        status=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ] || [ "$status" = "online" ]; then
            log_info "✓ Service status: $status"
            return 0
        else
            log_warn "Service status: $status"
            return 1
        fi
    else
        log_error "✗ Invalid JSON response"
        return 1
    fi
}

# 파일 시스템 확인 함수
check_filesystem() {
    log_info "Checking filesystem..."
    
    # 필수 파일 존재 확인
    local required_files=(
        "/usr/share/nginx/html/index.html"
        "/usr/share/nginx/html/static"
        "/etc/nginx/conf.d/default.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [ -e "$file" ]; then
            log_info "✓ $file exists"
        else
            log_error "✗ $file not found"
            return 1
        fi
    done
    
    # 쓰기 권한 확인
    local temp_file="/tmp/healthcheck_$$"
    if echo "test" > "$temp_file" 2>/dev/null; then
        log_info "✓ Filesystem is writable"
        rm -f "$temp_file"
    else
        log_error "✗ Filesystem is not writable"
        return 1
    fi
    
    return 0
}

# 메모리 사용량 확인 함수
check_memory() {
    log_info "Checking memory usage..."
    
    # 메모리 사용량 (MB 단위)
    local memory_usage
    memory_usage=$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2}' 2>/dev/null || echo "0")
    
    # 메모리 사용량이 90% 이상이면 경고
    if (( $(echo "$memory_usage > 90" | bc -l 2>/dev/null || echo 0) )); then
        log_warn "High memory usage: ${memory_usage}%"
        return 1
    else
        log_info "✓ Memory usage: ${memory_usage}%"
        return 0
    fi
}

# 프로세스 확인 함수
check_processes() {
    log_info "Checking processes..."
    
    # nginx 프로세스 확인
    if pgrep nginx >/dev/null 2>&1; then
        log_info "✓ nginx is running"
    else
        log_error "✗ nginx is not running"
        return 1
    fi
    
    return 0
}

# 네트워크 연결 확인 함수
check_network() {
    log_info "Checking network connectivity..."
    
    # 포트 3000이 열려있는지 확인
    if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
        log_info "✓ Port 3000 is listening"
    else
        log_error "✗ Port 3000 is not listening"
        return 1
    fi
    
    return 0
}

# 메인 헬스체크 함수
main_healthcheck() {
    local retry_count=0
    local all_checks_passed=false
    
    while [ $retry_count -lt $MAX_RETRIES ] && [ "$all_checks_passed" = false ]; do
        if [ $retry_count -gt 0 ]; then
            log_warn "Retry attempt $retry_count/$MAX_RETRIES..."
            sleep $RETRY_DELAY
        fi
        
        local checks_passed=0
        local total_checks=0
        
        # 1. 파일 시스템 확인
        total_checks=$((total_checks + 1))
        if check_filesystem; then
            checks_passed=$((checks_passed + 1))
        fi
        
        # 2. 프로세스 확인
        total_checks=$((total_checks + 1))
        if check_processes; then
            checks_passed=$((checks_passed + 1))
        fi
        
        # 3. 네트워크 확인
        total_checks=$((total_checks + 1))
        if check_network; then
            checks_passed=$((checks_passed + 1))
        fi
        
        # 4. 웹 서버 HTTP 상태 확인
        total_checks=$((total_checks + 1))
        if check_http_status "$HEALTH_CHECK_URL" "200"; then
            checks_passed=$((checks_passed + 1))
        fi
        
        # 5. 웹 서버 JSON 응답 확인
        total_checks=$((total_checks + 1))
        if check_json_response "$HEALTH_CHECK_URL"; then
            checks_passed=$((checks_passed + 1))
        fi
        
        # 6. 메모리 사용량 확인 (선택적)
        if check_memory; then
            log_info "✓ Memory check passed"
        fi
        
        # 7. API 서버 연결 확인 (선택적, 실패해도 OK)
        if check_http_status "$API_CHECK_URL" "200"; then
            log_info "✓ API server is reachable"
        else
            log_warn "API server is not reachable (this is OK if API runs separately)"
        fi
        
        # 결과 평가
        if [ $checks_passed -eq $total_checks ]; then
            all_checks_passed=true
            log_info "All health checks passed ($checks_passed/$total_checks)"
        else
            log_error "Health checks failed ($checks_passed/$total_checks)"
            retry_count=$((retry_count + 1))
        fi
    done
    
    if [ "$all_checks_passed" = true ]; then
        log_info "🎉 Container is healthy!"
        return 0
    else
        log_error "💥 Container is unhealthy after $MAX_RETRIES attempts"
        return 1
    fi
}

# 상세 정보 출력 함수
print_system_info() {
    echo "========================================="
    echo "NetSecure Container Health Check"
    echo "========================================="
    echo "Timestamp: $(date -Iseconds)"
    echo "Hostname: $(hostname)"
    echo "Container ID: $(hostname)"
    echo "========================================="
    echo ""
}

# 에러 처리
trap 'log_error "Health check interrupted"; exit 1' INT TERM

# 메인 실행
if [ "${1:-}" = "--verbose" ] || [ "${1:-}" = "-v" ]; then
    print_system_info
fi

main_healthcheck

exit $?