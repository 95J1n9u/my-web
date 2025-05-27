# KISA 네트워크 장비 취약점 분석 API 명세서

## 📋 기본 정보

- **API 이름**: KISA 네트워크 장비 취약점 분석 API
- **버전**: v1.0.0
- **Base URL**: `https://kisa-network-analyzer-production.up.railway.app`
- **프로토콜**: HTTPS
- **Content-Type**: `application/json`
- **인증**: 불필요 (공개 API)
- **문자 인코딩**: UTF-8

## 📖 API 개요

KISA(한국인터넷진흥원) 네트워크 장비 보안 가이드를 기반으로 네트워크 장비 설정 파일의 보안 취약점을 자동 탐지하는 REST API입니다.

### 주요 기능
- 38개 KISA 보안 점검 항목 자동 검사
- 5개 주요 벤더 지원 (Cisco, Juniper, Radware, Passport, Piolink)
- 실시간 설정 파일 분석
- 상세한 취약점 리포트 및 권고사항 제공

### 지원 보안 점검 항목
- **계정 관리**: 패스워드 설정, 복잡성, 암호화, 권한 관리
- **접근 관리**: VTY 접근 제한, Session Timeout, 프로토콜 보안
- **패치 관리**: 최신 보안 패치 적용 여부
- **로그 관리**: 원격 로그서버, NTP 연동, 타임스탬프
- **기능 관리**: 불필요한 서비스 차단, 보안 설정

---

## 🔌 엔드포인트

### 1. 헬스 체크

서비스 상태를 확인합니다.

```
GET /api/v1/health
```

#### 응답

**200 OK**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.123456Z",
  "service": "KISA Network Security Config Analyzer"
}
```

---

### 2. 룰 목록 조회

사용 가능한 모든 보안 점검 룰을 조회합니다.

```
GET /api/v1/rules
```

#### 응답

**200 OK**
```json
{
  "success": true,
  "totalRules": 38,
  "rules": [
    {
      "ruleId": "N-01",
      "title": "기본 패스워드 변경",
      "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
      "severity": "상",
      "category": "계정 관리",
      "deviceTypes": ["Cisco", "Alteon", "Passport", "Juniper", "Piolink"],
      "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "룰셋 조회 실패",
  "details": "상세 에러 정보"
}
```

---

### 3. 특정 룰 상세 조회

특정 룰의 상세 정보를 조회합니다.

```
GET /api/v1/rules/{rule_id}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `rule_id` | string | ✓ | 룰 ID (예: N-01, N-04) |

#### 응답

**200 OK**
```json
{
  "success": true,
  "rule": {
    "ruleId": "N-01",
    "title": "기본 패스워드 변경",
    "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
    "severity": "상",
    "category": "계정 관리",
    "deviceTypes": ["Cisco", "Alteon", "Passport", "Juniper", "Piolink"],
    "patterns": ["enable\\s+password\\s+(cisco|admin|password|123|1234|default)"],
    "negativePatterns": ["enable\\s+secret\\s+\\$1\\$"],
    "recommendation": "enable secret 명령어를 사용하여 암호화된 패스워드 설정 필요",
    "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "룰 'N-99'를 찾을 수 없습니다"
}
```

---

### 4. 지원 장비 타입 조회

지원되는 네트워크 장비 타입을 조회합니다.

```
GET /api/v1/device-types
```

#### 응답

**200 OK**
```json
{
  "success": true,
  "deviceTypes": ["Cisco", "Juniper", "Radware", "Passport", "Piolink"]
}
```

---

### 5. 설정 파일 분석 (메인 API)

네트워크 장비 설정 파일을 분석하여 보안 취약점을 탐지합니다.

```
POST /api/v1/config-analyze
```

#### Request Body

```json
{
  "deviceType": "Cisco",
  "configText": "version 15.1\nhostname Router\nenable password cisco123\nsnmp-server community public RO\nline vty 0 4\n password simple\n transport input telnet",
  "options": {
    "checkAllRules": true,
    "specificRuleIds": ["N-01", "N-04"],
    "returnRawMatches": false,
    "includeRecommendations": true
  }
}
```

#### Request Body 스키마

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `deviceType` | string | ✓ | 장비 타입 (Cisco, Juniper, Radware, Passport, Piolink) |
| `configText` | string | ✓ | 분석할 설정 파일 텍스트 (최대 50MB) |
| `options` | AnalysisOptions | ✗ | 분석 옵션 |

#### AnalysisOptions 스키마

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `checkAllRules` | boolean | true | 모든 룰 검사 여부 |
| `specificRuleIds` | string[] | null | 특정 룰만 검사할 경우 룰 ID 목록 |
| `returnRawMatches` | boolean | false | 원본 매치 텍스트 포함 여부 |
| `includeRecommendations` | boolean | true | 권고사항 포함 여부 |

#### 응답

**200 OK**
```json
{
  "success": true,
  "deviceType": "Cisco",
  "totalLines": 6,
  "issuesFound": 3,
  "analysisTime": 0.15,
  "timestamp": "2024-01-15T10:30:00Z",
  "results": [
    {
      "ruleId": "N-01",
      "severity": "상",
      "line": 3,
      "matchedText": "enable password cisco123",
      "description": "기본 패스워드를 변경하지 않고 사용",
      "recommendation": "enable secret 명령어로 암호화된 패스워드 설정 필요",
      "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정",
      "category": "계정 관리"
    },
    {
      "ruleId": "N-08", 
      "severity": "상",
      "line": 4,
      "matchedText": "snmp-server community public RO",
      "description": "SNMP 기본 또는 단순한 Community String 사용",
      "recommendation": "Public, Private 외 유추하기 어려운 복잡한 Community String 설정",
      "reference": "KISA 가이드 N-08 (상) 5.2 SNMP community string 복잡성 설정",
      "category": "기능 관리"
    },
    {
      "ruleId": "N-16",
      "severity": "중",
      "line": 7,
      "matchedText": "transport input telnet",
      "description": "VTY 접속 시 암호화되지 않은 프로토콜 사용",
      "recommendation": "VTY 라인에서 SSH만 허용하도록 설정",
      "reference": "KISA 가이드 N-16 (중) 2.3 VTY 접속 시 안전한 프로토콜 사용",
      "category": "접근 관리"
    }
  ],
  "statistics": {
    "totalRulesChecked": 25,
    "rulesPassed": 22,
    "rulesFailed": 3,
    "highSeverityIssues": 2,
    "mediumSeverityIssues": 1,
    "lowSeverityIssues": 0
  }
}
```

**400 Bad Request**
```json
{
  "success": false,
  "error": "요청 데이터 검증 실패",
  "details": [
    "deviceType은 필수 필드입니다",
    "지원되지 않는 장비 타입입니다"
  ]
}
```

**413 Payload Too Large**
```json
{
  "success": false,
  "error": "설정 파일이 너무 큽니다",
  "details": "최대 50MB까지 지원됩니다"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "설정 분석 실패",
  "details": "상세 에러 정보"
}
```

---

## 📊 데이터 스키마

### Rule 스키마

```json
{
  "ruleId": "string",
  "title": "string", 
  "description": "string",
  "severity": "상|중|하",
  "category": "string",
  "deviceTypes": "string[]",
  "reference": "string"
}
```

### RuleDetail 스키마

```json
{
  "ruleId": "string",
  "title": "string",
  "description": "string", 
  "severity": "상|중|하",
  "category": "string",
  "deviceTypes": "string[]",
  "patterns": "string[]",
  "negativePatterns": "string[]",
  "recommendation": "string",
  "reference": "string"
}
```

### VulnerabilityIssue 스키마

```json
{
  "ruleId": "string",
  "severity": "상|중|하",
  "line": "number",
  "matchedText": "string",
  "description": "string", 
  "recommendation": "string",
  "reference": "string",
  "category": "string",
  "rawMatch": "string?" // returnRawMatches=true일 때만 포함
}
```

### AnalysisStatistics 스키마

```json
{
  "totalRulesChecked": "number",
  "rulesPassed": "number", 
  "rulesFailed": "number",
  "highSeverityIssues": "number",
  "mediumSeverityIssues": "number",
  "lowSeverityIssues": "number"
}
```

### AnalysisResponse 스키마

```json
{
  "success": "boolean",
  "deviceType": "string",
  "totalLines": "number",
  "issuesFound": "number",
  "analysisTime": "number",
  "timestamp": "string",
  "results": "VulnerabilityIssue[]",
  "statistics": "AnalysisStatistics?"
}
```

---

## ⚠️ 에러 코드

| HTTP 상태 | 에러 코드 | 설명 | 해결 방법 |
|-----------|-----------|------|-----------|
| 400 | Bad Request | 잘못된 요청 데이터 | 요청 데이터 형식 및 필수 필드 확인 |
| 404 | Not Found | 요청한 리소스를 찾을 수 없음 | URL 경로 및 파라미터 확인 |
| 413 | Payload Too Large | 파일 크기가 50MB 초과 | 설정 파일 크기 축소 |
| 429 | Too Many Requests | 요청 한도 초과 (분당 100회) | 요청 간격 조정 |
| 500 | Internal Server Error | 서버 내부 오류 | 서버 관리자에게 문의 |

### 에러 응답 형식

```json
{
  "success": false,
  "error": "에러 메시지",
  "details": "상세 에러 정보 (선택적)"
}
```

---

## 📝 사용 가이드

### 기본 호출 순서

1. **헬스 체크**: 서비스 상태 확인
2. **장비 타입 조회**: 지원되는 장비 타입 확인
3. **룰 목록 조회**: 사용 가능한 룰 확인 (선택적)
4. **설정 분석**: 메인 분석 API 호출

### 요청 예시

```bash
# 헬스 체크
curl -X GET https://kisa-network-analyzer-production.up.railway.app/api/v1/health

# 설정 분석
curl -X POST https://kisa-network-analyzer-production.up.railway.app/api/v1/config-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "Cisco",
    "configText": "version 15.1\nhostname Router\nenable password cisco123",
    "options": {
      "checkAllRules": true,
      "includeRecommendations": true
    }
  }'
```

---

## 🔒 보안 고려사항

### 데이터 보안
- 업로드된 설정 파일은 서버에 저장되지 않음
- 모든 통신은 HTTPS로 암호화
- 개인정보나 민감한 정보는 수집하지 않음

### 사용 제한
- **파일 크기**: 최대 50MB
- **요청 빈도**: 분당 100회
- **동시 연결**: 최대 10개

---

## 📋 지원 보안 룰셋 (38개)

### 상급 (High) - 20개
- **N-01**: 기본 패스워드 변경
- **N-02**: 패스워드 복잡성 설정  
- **N-03**: 암호화된 패스워드 사용
- **N-04**: VTY 접근(ACL) 설정
- **N-05**: Session Timeout 설정
- **N-06**: 최신 보안 패치 적용
- **N-07**: SNMP 서비스 차단
- **N-08**: SNMP Community String 복잡성
- **N-09**: SNMP ACL 설정
- **N-10**: SNMP 커뮤니티 권한 설정
- **N-11**: TFTP 서비스 차단
- **N-12**: Spoofing 방지 필터링
- **N-13**: DDoS 공격 방어 설정
- **N-14**: 사용하지 않는 인터페이스 Shutdown

### 중급 (Medium) - 17개
- **N-15**: 사용자·명령어별 권한 수준 설정
- **N-16**: VTY 안전한 프로토콜 사용
- **N-17**: 불필요한 보조 입·출력 포트 사용 금지
- **N-18**: 로그온 시 경고 메시지 설정
- **N-20**: 로깅 버퍼 크기 설정
- **N-21**: 정책에 따른 로깅 설정
- **N-22**: NTP 서버 연동
- **N-24**: TCP Keepalive 서비스 설정
- **N-25**: Finger 서비스 차단
- **N-26**: 웹 서비스 차단
- **N-27**: TCP/UDP Small 서비스 차단
- **N-28**: Bootp 서비스 차단
- **N-29**: CDP 서비스 차단
- **N-30**: Directed-broadcast 차단
- **N-31**: Source 라우팅 차단
- **N-32**: Proxy ARP 차단
- **N-33**: ICMP unreachable, Redirect 차단
- **N-34**: identd 서비스 차단
- **N-35**: Domain Lookup 차단
- **N-36**: PAD 차단
- **N-37**: mask-reply 차단

### 하급 (Low) - 2개
- **N-19**: 원격 로그서버 사용
- **N-23**: timestamp 로그 설정
- **N-38**: 스위치, 허브 보안 강화

---

## 📞 지원 및 문의

- **API 문의**: API 관련 기술 문의
- **버그 리포트**: 오류 및 개선사항 제보
- **기능 요청**: 새로운 기능 요청

---

## 📄 변경 이력

### v1.0.0 (2024-01-15)
- 초기 릴리스
- KISA 가이드 기반 38개 룰 구현
- 5개 주요 벤더 지원
- REST API 제공

---

*이 문서는 KISA 네트워크 장비 취약점 분석 API v1.0.0 기준으로 작성되었습니다.*