# KISA 네트워크 장비 취약점 분석 API 명세서

**Version:** 1.3.0  
**Engine:** Multi-Framework 1.0  
**Last Updated:** 2025-05-28

## 📋 개요

KISA(한국인터넷진흥원) 네트워크 장비 보안 가이드를 기반으로 네트워크 장비 설정 파일의 보안 취약점을 자동으로 탐지하는 REST API입니다.

### 🆕 새로운 기능 (v1.3.0)
- **다중 지침서 지원**: KISA, CIS, NIST 등 다양한 보안 지침서 선택 가능
- **지침서별 룰셋**: 각 지침서에 특화된 보안 룰 적용
- **확장 가능한 구조**: 새로운 지침서 쉽게 추가 가능
- **기존 API 완전 호환**: 기존 사용자는 변경 없이 계속 사용 가능

### 🛡️ 지원 지침서
- **KISA** (한국인터넷진흥원): ✅ 완전 구현 (38개 룰)
- **CIS** (Center for Internet Security): 🚧 구현 예정
- **NIST** (National Institute of Standards): 🚧 계획 중

### 🔧 지원 장비
- Cisco IOS/IOS-XE
- Juniper JunOS  
- Radware Alteon
- Nortel Passport
- Piolink

---

## 🚀 Base URL

```
http://localhost:5002/api/v1
```

---

## 📊 상태 및 정보 조회

### GET /health
API 서버 상태 및 기본 정보 조회

**응답 예시:**
```json
{
  "status": "healthy",
  "version": "1.3.0",
  "engineVersion": "Multi-Framework 1.0",
  "timestamp": "2025-05-28T10:30:00.123456",
  "service": "KISA Network Security Config Analyzer (Multi-Framework)",
  "features": {
    "logicalAnalysis": true,
    "patternMatching": true,
    "multiFrameworkSupport": true,
    "frameworkComparison": true,
    "contextualParsing": true
  },
  "supportedFrameworks": ["KISA", "CIS", "NIST"],
  "implementedFrameworks": ["KISA"],
  "frameworkDetails": {
    "KISA": {
      "name": "KISA 네트워크 장비 보안 가이드",
      "version": "2024",
      "total_rules": 38
    }
  }
}
```

---

## 🗂️ 지침서 관리

### GET /frameworks
지원되는 보안 지침서 목록 조회

**응답 예시:**
```json
{
  "success": true,
  "totalFrameworks": 3,
  "implementedFrameworks": 1,
  "frameworks": [
    {
      "id": "KISA",
      "name": "KISA 네트워크 장비 보안 가이드",
      "description": "한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인",
      "version": "2024",
      "total_rules": 38,
      "categories": ["계정 관리", "접근 관리", "패치 관리", "로그 관리", "기능 관리"],
      "isImplemented": true,
      "status": "active",
      "statistics": {
        "totalRules": 38,
        "logicalRules": 38,
        "patternRules": 0
      }
    },
    {
      "id": "CIS",
      "name": "CIS Controls",
      "description": "Center for Internet Security Controls",
      "version": "v8",
      "total_rules": 0,
      "isImplemented": false,
      "status": "planned"
    }
  ]
}
```

### GET /frameworks/{framework_id}/rules
특정 지침서의 룰 목록 조회

**경로 파라미터:**
- `framework_id`: 지침서 ID (KISA, CIS, NIST)

**쿼리 파라미터:**
- `includeExamples` (boolean): 예시 포함 여부 (기본: false)
- `deviceType` (string): 장비 타입 필터
- `severity` (string): 심각도 필터 (상/중/하)

**응답 예시:**
```json
{
  "success": true,
  "framework": "KISA",
  "totalRules": 38,
  "filters": {
    "deviceType": "Cisco",
    "severity": null,
    "includeExamples": false
  },
  "engineInfo": {
    "logicalRules": 38,
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

## 📝 룰셋 조회

### GET /rules
사용 가능한 룰셋 목록 조회 (다중 지침서 지원)

**쿼리 파라미터:**
- `framework` (string): 지침서 선택 (기본: KISA)
- `includeExamples` (boolean): 예시 포함 여부 (기본: false)  
- `deviceType` (string): 장비 타입 필터
- `severity` (string): 심각도 필터 (상/중/하)

**요청 예시:**
```bash
GET /api/v1/rules?framework=KISA&deviceType=Cisco&severity=상
```

**응답 예시:**
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

### GET /rules/{rule_id}
특정 룰의 상세 정보 조회

**경로 파라미터:**
- `rule_id`: 룰 ID (예: N-01, CIS-1.1.1)

**쿼리 파라미터:**
- `framework` (string): 지침서 선택 (기본: KISA)
- `includeExamples` (boolean): 예시 포함 여부 (기본: true)

**응답 예시:**
```json
{
  "success": true,
  "framework": "KISA",
  "rule": {
    "ruleId": "N-01",
    "title": "기본 패스워드 변경",
    "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
    "severity": "상",
    "category": "계정 관리",
    "deviceTypes": ["Cisco", "Alteon", "Passport", "Juniper", "Piolink"],
    "patterns": ["enable\\s+password\\s+(cisco|admin|password|123)"],
    "negativePatterns": ["enable\\s+secret\\s+\\$1\\$"],
    "recommendation": "enable secret 명령어를 사용하여 암호화된 패스워드 설정 필요",
    "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정",
    "hasLogicalAnalysis": true,
    "framework": "KISA",
    "vulnerabilityExamples": {
      "Cisco": ["enable password cisco", "enable password admin123"]
    },
    "safeExamples": {
      "Cisco": ["enable secret $1$mERr$9cTjUIlM1MHmBpJl6bYKj1"]
    }
  }
}
```

---

## 🔧 장비 타입 조회

### GET /device-types
지원되는 장비 타입 목록 조회

**쿼리 파라미터:**
- `framework` (string): 지침서 선택 (기본: KISA)

**응답 예시:**
```json
{
  "success": true,
  "framework": "KISA",
  "deviceTypes": ["Cisco", "Juniper", "Radware", "Passport", "Piolink"],
  "deviceInfo": {
    "Cisco": {
      "supportedRules": 38,
      "logicalAnalysisRules": 38,
      "framework": "KISA",
      "features": {
        "contextParsing": true,
        "interfaceAnalysis": true,
        "serviceAnalysis": true
      }
    }
  },
  "totalDeviceTypes": 5
}
```

---

## 🛡️ 설정 분석

### POST /config-analyze
네트워크 장비 설정 파일 분석 (메인 기능)

**요청 Body:**
```json
{
  "deviceType": "Cisco",
  "framework": "KISA",
  "configText": "version 15.1\nhostname TestRouter\nenable password cisco123\nsnmp-server community public RO\nline vty 0 4\n password simple\n transport input telnet\nend",
  "options": {
    "checkAllRules": true,
    "specificRuleIds": ["N-01", "N-04"],
    "returnRawMatches": false,
    "enableLogicalAnalysis": true,
    "includeRecommendations": true
  }
}
```

**필수 필드:**
- `deviceType`: 장비 타입
- `configText`: 설정 파일 전체 텍스트

**선택 필드:**
- `framework`: 사용할 지침서 (기본: KISA)
- `options`: 분석 옵션

**분석 옵션:**
- `checkAllRules` (boolean): 모든 룰 검사 (기본: true)
- `specificRuleIds` (array): 특정 룰만 검사 (checkAllRules가 false일 때)
- `returnRawMatches` (boolean): 원본 매치 텍스트 포함 (기본: false)
- `enableLogicalAnalysis` (boolean): 논리 기반 분석 활성화 (기본: true)
- `includeRecommendations` (boolean): 권고사항 포함 (기본: true)

**응답 예시:**
```json
{
  "success": true,
  "deviceType": "Cisco",
  "framework": "KISA",
  "frameworkInfo": {
    "name": "KISA 네트워크 장비 보안 가이드",
    "version": "2024",
    "total_rules": 38
  },
  "totalLines": 8,
  "issuesFound": 3,
  "analysisTime": 0.15,
  "timestamp": "2025-05-28T10:30:00.123456",
  "engineVersion": "Multi-Framework 1.0",
  "contextInfo": {
    "totalInterfaces": 1,
    "activeInterfaces": 0,
    "configuredServices": 2,
    "globalSettings": 3,
    "deviceType": "Cisco",
    "configComplexity": "Simple"
  },
  "analysisDetails": {
    "rulesApplied": 38,
    "logicalRulesUsed": 3,
    "patternRulesUsed": 0
  },
  "results": [
    {
      "ruleId": "N-01",
      "severity": "상",
      "line": 3,
      "matchedText": "enable password cisco123",
      "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
      "recommendation": "enable secret 명령어를 사용하여 암호화된 패스워드 설정 필요",
      "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정",
      "category": "계정 관리",
      "framework": "KISA",
      "analysisType": "logical"
    },
    {
      "ruleId": "N-08",
      "severity": "상",
      "line": 4,
      "matchedText": "snmp-server community public RO",
      "description": "기본 또는 단순한 SNMP Community String 사용 여부 점검",
      "recommendation": "Public, Private 외 유추하기 어려운 복잡한 Community String 설정",
      "reference": "KISA 가이드 N-08 (상) 5.2 SNMP community string 복잡성 설정",
      "category": "기능 관리",
      "framework": "KISA",
      "analysisType": "logical"
    },
    {
      "ruleId": "N-16",
      "severity": "중",
      "line": 7,
      "matchedText": "transport input telnet",
      "description": "VTY 접속 시 암호화되지 않은 프로토콜 사용",
      "recommendation": "VTY 라인에서 SSH만 허용하도록 설정",
      "reference": "KISA 가이드 N-16 (중) 2.3 VTY 접속 시 안전한 프로토콜 사용",
      "category": "접근 관리",
      "framework": "KISA",
      "analysisType": "logical"
    }
  ],
  "statistics": {
    "totalRulesChecked": 38,
    "rulesPassed": 35,
    "rulesFailed": 3,
    "highSeverityIssues": 2,
    "mediumSeverityIssues": 1,
    "lowSeverityIssues": 0
  },
  "validationWarnings": []
}
```

### 🔄 기존 API 호환성

기존 API는 **완전히 호환**됩니다. `framework` 파라미터를 생략하면 기본값(KISA)이 적용됩니다.

**기존 방식 (여전히 작동):**
```json
{
  "deviceType": "Cisco",
  "configText": "enable password cisco123",
  "options": {
    "checkAllRules": true
  }
}
```

---

## 🧪 기타 분석 기능

### POST /config-validate
설정 파일 문법 검증

**요청 Body:**
```json
{
  "deviceType": "Cisco",
  "configText": "version 15.1\nhostname TestRouter"
}
```

**응답 예시:**
```json
{
  "success": true,
  "isValid": true,
  "errorCount": 0,
  "errors": [],
  "deviceType": "Cisco",
  "totalLines": 2
}
```

### POST /analyze-line
단일 라인 분석 (디버깅/테스트용)

**요청 Body:**
```json
{
  "line": "enable password cisco123",
  "deviceType": "Cisco",
  "framework": "KISA",
  "ruleIds": ["N-01"]
}
```

**응답 예시:**
```json
{
  "success": true,
  "framework": "KISA",
  "line": "enable password cisco123",
  "deviceType": "Cisco",
  "appliedRules": ["N-01"],
  "issuesFound": 1,
  "results": [
    {
      "ruleId": "N-01",
      "severity": "상",
      "line": 1,
      "matchedText": "cisco123",
      "description": "기본 패스워드를 변경하지 않고 사용하는지 점검",
      "recommendation": "enable secret 명령어를 사용하여 암호화된 패스워드 설정 필요",
      "reference": "KISA 가이드 N-01 (상) 1.1 패스워드 설정",
      "category": "계정 관리"
    }
  ]
}
```

---

## 📊 통계 및 모니터링

### GET /statistics
분석 엔진 통계 정보 조회

**쿼리 파라미터:**
- `framework` (string): 지침서 선택 (기본: KISA)

**응답 예시:**
```json
{
  "success": true,
  "framework": "KISA",
  "engineStatistics": {
    "analysisStats": {
      "total_analyses": 1337,
      "framework_usage": {
        "KISA": 1200,
        "CIS": 137
      }
    },
    "supportedFrameworks": ["KISA", "CIS", "NIST"],
    "defaultFramework": "KISA"
  },
  "ruleStatistics": {
    "totalRules": 38,
    "severityStats": {
      "상": 14,
      "중": 19,
      "하": 5
    },
    "categoryStats": {
      "계정 관리": 4,
      "접근 관리": 6,
      "패치 관리": 1,
      "로그 관리": 8,
      "기능 관리": 19
    },
    "logicalRules": 38,
    "patternRules": 0
  },
  "timestamp": "2025-05-28T10:30:00.123456"
}
```

---

## ⚠️ 에러 처리

### 일반적인 에러 응답

**400 Bad Request:**
```json
{
  "success": false,
  "error": "요청 데이터 검증 실패",
  "details": ["deviceType은 필수 필드입니다"],
  "supportedFrameworks": ["KISA", "CIS", "NIST"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "지원되지 않는 지침서입니다: INVALID",
  "supportedFrameworks": ["KISA", "CIS", "NIST"]
}
```

**501 Not Implemented:**
```json
{
  "success": false,
  "error": "CIS 지침서는 아직 구현되지 않았습니다.",
  "implementedFrameworks": ["KISA"]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "설정 분석 실패",
  "details": "Internal processing error",
  "engineVersion": "Multi-Framework 1.0"
}
```

---

## 🔍 사용 예시

### Python으로 KISA 분석
```python
import requests

# KISA 지침서로 분석
response = requests.post('http://localhost:5002/api/v1/config-analyze', json={
    "deviceType": "Cisco",
    "framework": "KISA",
    "configText": """
        version 15.1
        hostname TestRouter
        enable password cisco123
        snmp-server community public RO
        line vty 0 4
         password simple
         transport input telnet
    """,
    "options": {
        "checkAllRules": True,
        "includeRecommendations": True
    }
})

if response.status_code == 200:
    result = response.json()
    print(f"지침서: {result['framework']}")
    print(f"취약점: {result['issuesFound']}개 발견")
    
    for issue in result['results']:
        print(f"[{issue['severity']}] {issue['ruleId']}: {issue['description']}")
else:
    print(f"분석 실패: {response.status_code}")
```

### curl로 지침서 목록 조회
```bash
# 지원 지침서 확인
curl -X GET http://localhost:5002/api/v1/frameworks

# KISA 룰 목록 조회  
curl -X GET "http://localhost:5002/api/v1/rules?framework=KISA&deviceType=Cisco"

# 기존 방식으로 분석 (기본: KISA)
curl -X POST http://localhost:5002/api/v1/config-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "Cisco", 
    "configText": "enable password cisco123",
    "options": {"checkAllRules": true}
  }'
```

---

## 🚀 마이그레이션 가이드

### 기존 사용자 (v1.2.x → v1.3.0)
- **변경 없음**: 기존 API 호출 방식 그대로 사용 가능
- **새 기능**: 필요 시 `framework` 파라미터 추가

### 새로운 기능 사용
```json
// 기존 방식 (계속 작동)
{
  "deviceType": "Cisco",
  "configText": "...",
  "options": {"checkAllRules": true}
}

// 새로운 방식 (지침서 선택)
{
  "deviceType": "Cisco", 
  "framework": "KISA",
  "configText": "...",
  "options": {"checkAllRules": true}
}
```

---

## 🛠️ 개발자 정보

- **API Version**: 1.3.0
- **Engine Version**: Multi-Framework 1.0  
- **지원 언어**: Python 3.8+
- **프레임워크**: Flask 2.3.3
- **라이선스**: MIT
- **문의**: security@example.com

### 구현 상태
- ✅ **KISA**: 완전 구현 (38개 룰)
- 🚧 **CIS**: 구현 예정 (11개 룰 준비됨)
- 🚧 **NIST**: 계획 중

**최신 업데이트 확인**: `GET /api/v1/health`