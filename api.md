# 네트워크 장비 보안 취약점 분석 API 명세서

## 개요

KISA, CIS, NW 등 다양한 보안 지침서를 기반으로 네트워크 장비의 설정 파일을 분석하여 보안 취약점을 탐지하는 REST API입니다.

- **Base URL**: `http://localhost:5000/api/v1`
- **API Version**: 1.3.0 (Multi-Framework)
- **Content-Type**: `application/json`
- **지원 지침서**: KISA (38룰), CIS (11룰), NW (42룰)

## 인증

현재 버전에서는 인증이 필요하지 않습니다.

---

## 📋 엔드포인트 목록

### 1. 시스템 상태
- [GET /health](#get-health) - API 상태 확인

### 2. 지침서 관리
- [GET /frameworks](#get-frameworks) - 지원 지침서 목록 조회
- [GET /frameworks/{framework_id}/rules](#get-frameworksframework_idrules) - 특정 지침서 룰 목록

### 3. 설정 분석
- [POST /config-analyze](#post-config-analyze) - 설정 파일 분석 (메인)
- [POST /analyze-line](#post-analyze-line) - 단일 라인 분석

### 4. 룰 관리
- [GET /rules](#get-rules) - 룰 목록 조회
- [GET /device-types](#get-device-types) - 지원 장비 타입 조회

### 5. 통계 및 정보
- [GET /statistics](#get-statistics) - 분석 엔진 통계

---

## 📡 엔드포인트 상세

### GET /health

API 상태 및 지원 기능 확인

#### 응답

```json
{
  "status": "healthy",
  "version": "1.3.0",
  "engineVersion": "Multi-Framework 1.0",
  "timestamp": "2025-05-30T10:30:00.123456",
  "service": "KISA Network Security Config Analyzer (Multi-Framework)",
  "features": {
    "logicalAnalysis": true,
    "patternMatching": true,
    "multiFrameworkSupport": true,
    "frameworkComparison": true,
    "contextualParsing": true
  },
  "supportedFrameworks": ["KISA", "CIS", "NW", "NIST"],
  "implementedFrameworks": ["KISA", "CIS", "NW"],
  "frameworkDetails": {
    "KISA": {
      "name": "KISA 네트워크 장비 보안 가이드",
      "version": "2024",
      "total_rules": 38
    },
    "CIS": {
      "name": "CIS Controls",
      "version": "v8",
      "total_rules": 11
    },
    "NW": {
      "name": "NW 네트워크 보안 지침서",
      "version": "2024",
      "total_rules": 42
    }
  }
}
```

---

### GET /frameworks

지원되는 보안 지침서 목록 조회

#### 응답

```json
{
  "success": true,
  "totalFrameworks": 4,
  "implementedFrameworks": 3,
  "frameworks": [
    {
      "id": "KISA",
      "name": "KISA 네트워크 장비 보안 가이드",
      "description": "한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인",
      "version": "2024",
      "total_rules": 38,
      "categories": ["계정 관리", "접근 관리", "패치 관리", "로그 관리", "기능 관리"],
      "statistics": {
        "totalRules": 38,
        "severityStats": {"상": 14, "중": 19, "하": 5},
        "deviceStats": {"Cisco": 38, "Juniper": 25, "Piolink": 30}
      },
      "isImplemented": true,
      "status": "active"
    },
    {
      "id": "CIS",
      "name": "CIS Controls",
      "description": "Center for Internet Security Controls",
      "version": "v8",
      "total_rules": 11,
      "categories": ["계정 관리", "접근 관리", "로그 관리"],
      "isImplemented": true,
      "status": "active"
    },
    {
      "id": "NW",
      "name": "NW 네트워크 보안 지침서",
      "description": "네트워크 보안 강화 지침서",
      "version": "2024",
      "total_rules": 42,
      "categories": ["계정 관리", "접근 관리", "기능 관리", "로그 관리", "패치 관리"],
      "isImplemented": true,
      "status": "active"
    },
    {
      "id": "NIST",
      "name": "NIST Cybersecurity Framework",
      "version": "2.0",
      "total_rules": 0,
      "isImplemented": false,
      "status": "planned"
    }
  ]
}
```

---

### POST /config-analyze

네트워크 장비 설정 파일 보안 취약점 분석 (메인 기능)

#### 요청 파라미터

```json
{
  "deviceType": "Cisco",                    // 필수: 장비 타입
  "framework": "KISA",                      // 선택: 지침서 (기본값: KISA)
  "configText": "...",                      // 필수: 설정 파일 전체 텍스트
  "options": {                              // 선택: 분석 옵션
    "checkAllRules": true,                  // 모든 룰 검사 여부
    "specificRuleIds": ["N-01", "N-04"],   // 특정 룰만 검사 (checkAllRules: false일 때)
    "returnRawMatches": false,              // 원본 매칭 텍스트 반환 여부
    "enableLogicalAnalysis": true,          // 논리적 분석 활성화
    "includeRecommendations": true          // 권고사항 포함 여부
  }
}
```

#### 지원 장비 타입
- **Cisco**: KISA(38) + CIS(11) + NW(42) = 91개 룰
- **Juniper**: KISA(38) + NW(35) = 73개 룰
- **HP**: NW(30) = 30개 룰
- **Piolink**: KISA(38) + NW(35) = 73개 룰
- **Radware**: KISA(25) + NW(20) = 45개 룰
- **Passport**: KISA(25) + NW(15) = 40개 룰
- **Alteon**: KISA(20) + NW(18) = 38개 룰
- **Dasan**: NW(25) = 25개 룰
- **Alcatel**: NW(28) = 28개 룰

#### 요청 예시

```bash
curl -X POST http://localhost:5000/api/v1/config-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "Cisco",
    "framework": "NW",
    "configText": "version 15.1\nhostname Router01\nenable password cisco123\nsnmp-server community public RW\nline vty 0 4\n password simple\n transport input telnet",
    "options": {
      "checkAllRules": true,
      "enableLogicalAnalysis": true,
      "includeRecommendations": true
    }
  }'
```

#### 응답

```json
{
  "success": true,
  "framework": "NW",
  "frameworkInfo": {
    "name": "NW 네트워크 보안 지침서",
    "version": "2024",
    "total_rules": 42
  },
  "deviceType": "Cisco",
  "totalLines": 7,
  "issuesFound": 4,
  "analysisTime": 0.15,
  "timestamp": "2025-05-30T10:30:00.123456",
  "engineVersion": "Multi-Framework 1.0",
  "results": [
    {
      "ruleId": "NW-01",
      "severity": "상",
      "line": 3,
      "matchedText": "enable password cisco123",
      "description": "기본 패스워드를 변경하지 않고 사용",
      "recommendation": "기본 패스워드를 강력한 패스워드로 변경하고 enable secret 사용",
      "reference": "NW 가이드 NW-01 (상) 비밀번호 설정",
      "category": "계정 관리",
      "framework": "NW",
      "analysisType": "logical"
    },
    {
      "ruleId": "NW-17",
      "severity": "중",
      "line": 4,
      "matchedText": "snmp-server community public RW",
      "description": "SNMP 기본 커뮤니티 스트링 사용",
      "recommendation": "Public, Private 외 복잡한 커뮤니티 스트링 설정",
      "reference": "NW 가이드 NW-17 (중) SNMP community string 복잡성 설정",
      "category": "기능 관리",
      "framework": "NW",
      "analysisType": "logical"
    },
    {
      "ruleId": "NW-19",
      "severity": "중",
      "line": 4,
      "matchedText": "snmp-server community public RW",
      "description": "SNMP 커뮤니티에 RW 권한 설정",
      "recommendation": "SNMP Community String에 RO(Read-Only) 권한 적용",
      "reference": "NW 가이드 NW-19 (중) SNMP 커뮤니티 권한 설정",
      "category": "기능 관리",
      "framework": "NW",
      "analysisType": "logical"
    },
    {
      "ruleId": "NW-07",
      "severity": "중",
      "line": 7,
      "matchedText": "transport input telnet",
      "description": "VTY 접속 시 암호화되지 않은 프로토콜 사용",
      "recommendation": "네트워크 장비에서 암호화 통신인 SSH를 활용",
      "reference": "NW 가이드 NW-07 (중) VTY 접속 시 안전한 프로토콜 사용",
      "category": "접근 관리",
      "framework": "NW",
      "analysisType": "logical"
    }
  ],
  "statistics": {
    "totalRulesChecked": 30,
    "rulesPassed": 26,
    "rulesFailed": 4,
    "highSeverityIssues": 1,
    "mediumSeverityIssues": 3,
    "lowSeverityIssues": 0
  },
  "contextInfo": {
    "totalInterfaces": 0,
    "activeInterfaces": 0,
    "configuredServices": 0,
    "globalSettings": 1,
    "deviceType": "Cisco",
    "configComplexity": "Simple"
  },
  "analysisDetails": {
    "rulesApplied": 30,
    "logicalRulesUsed": 4,
    "patternRulesUsed": 0
  },
  "validationWarnings": []
}
```

#### 오류 응답

```json
{
  "success": false,
  "error": "지원되지 않는 지침서입니다: UNKNOWN",
  "supportedFrameworks": ["KISA", "CIS", "NW"],
  "details": "UNKNOWN framework is not supported"
}
```

---

### GET /frameworks/{framework_id}/rules

특정 지침서의 룰 목록 조회

#### URL 파라미터
- `framework_id`: 지침서 ID (KISA, CIS, NW)

#### 쿼리 파라미터
- `includeExamples`: 예제 포함 여부 (기본값: false)
- `deviceType`: 특정 장비 타입으로 필터링
- `severity`: 심각도로 필터링 (상/중/하)

#### 요청 예시

```bash
curl "http://localhost:5000/api/v1/frameworks/NW/rules?deviceType=Cisco&includeExamples=true"
```

#### 응답

```json
{
  "success": true,
  "framework": "NW",
  "totalRules": 42,
  "rules": [
    {
      "ruleId": "NW-01",
      "title": "비밀번호 설정",
      "description": "장비 출고 시 설정된 기본 관리자 계정과 비밀번호를 변경하지 않고 사용하는지 점검",
      "severity": "상",
      "category": "계정 관리",
      "deviceTypes": ["Cisco", "Alteon", "Passport", "Juniper", "Piolink", "HP", "Dasan", "Alcatel"],
      "reference": "NW 가이드 NW-01 (상) 비밀번호 설정",
      "hasLogicalAnalysis": true,
      "framework": "NW",
      "vulnerabilityExamples": {
        "Cisco": [
          "enable password cisco123",
          "username admin password admin",
          "username root password cisco"
        ]
      },
      "safeExamples": {
        "Cisco": [
          "enable secret $1$mERr$9cTjUIlM1MHmBpJl6bYKj1",
          "username admin secret $1$abc$xyz123456789",
          "service password-encryption"
        ]
      }
    }
  ]
}
```

---

### GET /rules

룰 목록 조회 (모든 지침서 통합 또는 특정 지침서)

#### 쿼리 파라미터
- `framework`: 지침서 필터 (기본값: KISA)
- `deviceType`: 장비 타입 필터
- `severity`: 심각도 필터 (상/중/하)
- `includeExamples`: 예제 포함 여부 (기본값: false)

#### 요청 예시

```bash
curl "http://localhost:5000/api/v1/rules?framework=KISA&severity=상&deviceType=Cisco"
```

#### 응답

```json
{
  "success": true,
  "framework": "KISA",
  "totalRules": 14,
  "filters": {
    "deviceType": "Cisco",
    "severity": "상",
    "includeExamples": false
  },
  "engineInfo": {
    "logicalRules": 14,
    "patternRules": 0
  },
  "rules": [
    {
      "ruleId": "N-01",
      "title": "기본 패스워드 변경",
      "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
      "severity": "상",
      "category": "계정 관리",
      "deviceTypes": ["Cisco", "Alteon", "Passport", "Juniper", "Piolink"],
      "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정",
      "hasLogicalAnalysis": true,
      "framework": "KISA"
    }
  ]
}
```

---

### GET /device-types

지원되는 장비 타입 목록 조회

#### 쿼리 파라미터
- `framework`: 지침서별 지원 장비 조회 (기본값: KISA)

#### 요청 예시

```bash
curl "http://localhost:5000/api/v1/device-types?framework=NW"
```

#### 응답

```json
{
  "success": true,
  "framework": "NW",
  "deviceTypes": ["Cisco", "Juniper", "HP", "Piolink", "Radware", "Dasan", "Alcatel", "Extreme"],
  "deviceInfo": {
    "Cisco": {
      "supportedRules": 42,
      "logicalAnalysisRules": 20,
      "framework": "NW",
      "features": {
        "contextParsing": true,
        "interfaceAnalysis": true,
        "serviceAnalysis": true
      }
    },
    "HP": {
      "supportedRules": 30,
      "logicalAnalysisRules": 15,
      "framework": "NW",
      "features": {
        "contextParsing": true,
        "interfaceAnalysis": true,
        "serviceAnalysis": true
      }
    }
  },
  "totalDeviceTypes": 8
}
```

---

### POST /analyze-line

단일 라인 실시간 분석

#### 요청 파라미터

```json
{
  "line": "enable password cisco123",      // 필수: 분석할 설정 라인
  "deviceType": "Cisco",                   // 필수: 장비 타입
  "framework": "NW",                       // 선택: 지침서 (기본값: KISA)
  "ruleIds": ["NW-01", "NW-02"]          // 선택: 특정 룰만 적용
}
```

#### 요청 예시

```bash
curl -X POST http://localhost:5000/api/v1/analyze-line \
  -H "Content-Type: application/json" \
  -d '{
    "line": "snmp-server community public RW",
    "deviceType": "Cisco",
    "framework": "NW"
  }'
```

#### 응답

```json
{
  "success": true,
  "framework": "NW",
  "line": "snmp-server community public RW",
  "deviceType": "Cisco",
  "appliedRules": "all",
  "issuesFound": 2,
  "results": [
    {
      "ruleId": "NW-17",
      "severity": "중",
      "line": 1,
      "matchedText": "snmp-server community public RW",
      "description": "SNMP 기본 커뮤니티 스트링 사용",
      "recommendation": "복잡한 커뮤니티 스트링 설정",
      "reference": "NW 가이드 NW-17 (중) SNMP community string 복잡성 설정",
      "category": "기능 관리"
    },
    {
      "ruleId": "NW-19",
      "severity": "중",
      "line": 1,
      "matchedText": "snmp-server community public RW",
      "description": "SNMP 커뮤니티에 RW 권한 설정",
      "recommendation": "RO 권한으로 변경",
      "reference": "NW 가이드 NW-19 (중) SNMP 커뮤니티 권한 설정",
      "category": "기능 관리"
    }
  ]
}
```

---

### GET /statistics

분석 엔진 통계 정보 조회

#### 쿼리 파라미터
- `framework`: 특정 지침서 통계 (기본값: KISA)

#### 요청 예시

```bash
curl "http://localhost:5000/api/v1/statistics?framework=NW"
```

#### 응답

```json
{
  "success": true,
  "framework": "NW",
  "engineStatistics": {
    "analysisStats": {
      "total_analyses": 1250,
      "framework_usage": {
        "KISA": 800,
        "CIS": 150,
        "NW": 300
      }
    },
    "supportedFrameworks": ["KISA", "CIS", "NW"],
    "defaultFramework": "KISA"
  },
  "ruleStatistics": {
    "totalRules": 42,
    "severityStats": {
      "상": 8,
      "중": 30,
      "하": 4
    },
    "categoryStats": {
      "계정 관리": 4,
      "접근 관리": 6,
      "기능 관리": 28,
      "로그 관리": 3,
      "패치 관리": 1
    },
    "deviceStats": {
      "Cisco": 42,
      "HP": 30,
      "Juniper": 35,
      "Piolink": 35
    },
    "logicalRules": 20,
    "patternRules": 22
  },
  "timestamp": "2025-05-30T10:30:00.123456"
}
```

---

## 📊 지침서별 룰 비교

### 룰 수 비교
| 지침서 | 총 룰 수 | 상급 | 중급 | 하급 | 특징 |
|--------|----------|------|------|------|------|
| **KISA** | 38개 | 14개 | 19개 | 5개 | 한국 표준, 종합적 |
| **CIS** | 11개 | 6개 | 5개 | 0개 | AAA 중심, 상세함 |
| **NW** | 42개 | 8개 | 30개 | 4개 | 물리보안 강화 |

### 카테고리별 룰 분포
| 카테고리 | KISA | CIS | NW | 총합 |
|----------|------|-----|-----|------|
| 계정 관리 | 3개 | 3개 | 4개 | 10개 |
| 접근 관리 | 5개 | 3개 | 6개 | 14개 |
| 기능 관리 | 25개 | 0개 | 28개 | 53개 |
| 로그 관리 | 4개 | 5개 | 3개 | 12개 |
| 패치 관리 | 1개 | 0개 | 1개 | 2개 |

### 장비 지원 현황
| 장비 | KISA | CIS | NW | 최대 룰 수 |
|------|------|-----|-----|------------|
| **Cisco** | ✅ 38개 | ✅ 11개 | ✅ 42개 | **91개** |
| **Juniper** | ✅ 25개 | ❌ | ✅ 35개 | **60개** |
| **HP** | ❌ | ❌ | ✅ 30개 | **30개** |
| **Piolink** | ✅ 30개 | ❌ | ✅ 35개 | **65개** |
| **Radware** | ✅ 25개 | ❌ | ✅ 20개 | **45개** |

---

## 🔄 분석 모드

### 1. 단일 지침서 분석 (기본)
```json
{
  "framework": "KISA",
  "options": {"checkAllRules": true}
}
```

### 2. 특정 룰만 분석
```json
{
  "framework": "NW",
  "options": {
    "checkAllRules": false,
    "specificRuleIds": ["NW-01", "NW-17", "NW-19"]
  }
}
```

### 3. 논리적 분석 활성화
```json
{
  "options": {
    "enableLogicalAnalysis": true,
    "returnRawMatches": true
  }
}
```

---

## ⚠️ 오류 코드

### 400 Bad Request
```json
{
  "success": false,
  "error": "요청 데이터 검증 실패",
  "details": ["deviceType은 필수 필드입니다"],
  "warnings": ["설정 파일이 너무 짧습니다"]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "지원되지 않는 지침서: UNKNOWN",
  "supportedFrameworks": ["KISA", "CIS", "NW"]
}
```

### 501 Not Implemented
```json
{
  "success": false,
  "error": "NIST 지침서는 아직 구현되지 않았습니다",
  "implementedFrameworks": ["KISA", "CIS", "NW"]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "설정 분석 실패",
  "details": "Internal processing error",
  "engineVersion": "Multi-Framework 1.0"
}
```

---

## 📈 성능 정보

### 분석 속도
- **소형 설정** (< 100 라인): ~0.05초
- **중형 설정** (100-1000 라인): ~0.1-0.5초  
- **대형 설정** (1000-5000 라인): ~0.5-2초
- **초대형 설정** (> 5000 라인): ~2-10초

### 메모리 사용량
- **기본 분석**: ~50MB
- **논리적 분석**: ~100MB
- **다중 지침서**: ~150MB

### 동시 처리
- **권장 동시 요청**: 10개 이하
- **최대 설정 크기**: 50MB
- **최대 분석 시간**: 5분 (타임아웃)

---

## 🔧 사용 예시

### Python 클라이언트 예시
```python
import requests

# 기본 분석
response = requests.post('http://localhost:5000/api/v1/config-analyze', json={
    "deviceType": "Cisco",
    "framework": "NW",
    "configText": open('config.txt').read(),
    "options": {"checkAllRules": True}
})

result = response.json()
print(f"취약점 {result['issuesFound']}개 발견")
for issue in result['results']:
    print(f"- {issue['ruleId']}: {issue['description']}")
```

### JavaScript 클라이언트 예시
```javascript
const analyzeConfig = async (configText) => {
  const response = await fetch('/api/v1/config-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceType: 'HP',
      framework: 'NW',
      configText: configText,
      options: { checkAllRules: true }
    })
  });
  
  const result = await response.json();
  console.log(`분석 완료: ${result.issuesFound}개 취약점`);
  return result;
};
```

### cURL 배치 분석 예시
```bash
#!/bin/bash
# 여러 설정 파일 일괄 분석

for config_file in configs/*.cfg; do
  echo "분석 중: $config_file"
  curl -s -X POST http://localhost:5000/api/v1/config-analyze \
    -H "Content-Type: application/json" \
    -d "{
      \"deviceType\": \"Cisco\",
      \"framework\": \"NW\",
      \"configText\": \"$(cat $config_file | sed 's/"/\\"/g')\",
      \"options\": {\"checkAllRules\": true}
    }" | jq '.issuesFound'
done
```

---

## 📋 체크리스트

### API 연동 전 확인사항
- [ ] 지원 장비 타입 확인 (`GET /device-types`)
- [ ] 지원 지침서 확인 (`GET /frameworks`)
- [ ] 설정 파일 크기 제한 (50MB 이하)
- [ ] 네트워크 연결 및 포트 접근 가능 여부

### 분석 결과 해석
- [ ] `success` 필드로 요청 성공 여부 확인
- [ ] `framework` 필드로 사용된 지침서 확인
- [ ] `issuesFound` 개수와 `results` 배열 길이 일치 확인
- [ ] 심각도별 취약점 분류 (`severity`: 상/중/하)
- [ ] 카테고리별 취약점 분석 (`category`)

### 성능 최적화
- [ ] 대용량 설정은 청크 단위로 분할 분석
- [ ] 자주 사용하는 룰만 `specificRuleIds`로 지정
- [ ] `returnRawMatches: false`로 응답 크기 최소화
- [ ] 동시 요청 수 제한 (권장: 10개 이하)

---

## 🤝 지원

### 문의 채널
- **기술 지원**: [GitHub Issues](https://github.com/your-org/kisa-network-analyzer/issues)
- **API 문서**: [Wiki](https://github.com/your-org/kisa-network-analyzer/wiki)
- **이메일**: security@example.com

### 버전 호환성
- **v1.0.x**: KISA 지침서만 지원
- **v1.1.x**: CIS 지침서 추가
- **v1.2.x**: 다중 지침서 아키텍처
- **v1.3.x**: NW 지침서 추가 (현재)

---

*📝 이 문서는 API 버전 1.3.0 기준으로 작성되었습니다. 최신 정보는 `/health` 엔드포인트를 통해 확인하세요.*