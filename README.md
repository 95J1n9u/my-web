# 넷시큐어 (NetSecure) - 다중 지침서 네트워크 보안 분석기

네트워크 장비 설정 파일을 다양한 보안 지침서(KISA, CIS, NW 등)로 동시에 분석하여 취약점을 탐지하는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 📋 다중 보안 지침서 지원
- **KISA** (한국인터넷진흥원): 38개 룰 - 한국 표준, 종합적 분석
- **CIS** (Center for Internet Security): 11개 룰 - AAA 중심, 상세한 인증/권한 분석
- **NW** (네트워크 보안 지침서): 42개 룰 - 물리 보안 강화, 최다 룰셋
- **NIST** (National Institute of Standards): 구현 예정

### 🔧 지원 장비 (10개 브랜드)
| 장비 브랜드 | 지원 지침서 | 최대 룰 수 |
|-------------|-------------|------------|
| **Cisco** | KISA + CIS + NW | 91개 |
| **Piolink** | KISA + NW | 65개 |
| **Juniper** | KISA + NW | 60개 |
| **Radware** | KISA + NW | 45개 |
| **Passport** | KISA + NW | 40개 |
| **Alteon** | KISA + NW | 38개 |
| **HP** | NW | 30개 |
| **Alcatel** | NW | 28개 |
| **Dasan** | NW | 25개 |
| **Extreme** | NW | 25개 |

### ⚡ 분석 기능
- **단일 지침서 분석**: 특정 보안 표준으로 상세 분석
- **다중 지침서 비교**: 여러 지침서를 동시에 적용하여 종합 분석
- **논리 기반 탐지**: 단순 패턴 매칭을 넘어선 지능형 분석
- **실시간 분석**: 평균 10-30초 내 결과 제공
- **상세한 권고사항**: 각 지침서별 맞춤 해결방안 제시

## 🛠️ 기술 스택

### Frontend
- **React 19.1.0** - 메인 UI 프레임워크
- **Tailwind CSS 3.4.17** - 스타일링
- **Lucide React** - 아이콘
- **Recharts** - 데이터 시각화

### Backend API
- **Base URL**: `http://localhost:5000/api/v1`
- **Engine**: Multi-Framework 1.0
- **분석 엔진**: 논리 기반 + 패턴 매칭

### 개발 도구
- **Create React App 5.0.1**
- **PostCSS + Autoprefixer**
- **ESLint + Prettier**

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-org/netsecure-analyzer.git
cd netsecure-analyzer
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
REACT_APP_SERVICE_NAME=NetSecure Multi-Framework Analyzer
REACT_APP_VERSION=2.0.0
```

### 4. 개발 서버 실행
```bash
npm start
```
브라우저에서 `http://localhost:3000` 접속

### 5. 프로덕션 빌드
```bash
npm run build
```

## 🔧 API 서버 설정

분석 API 서버가 `http://localhost:5000`에서 실행되고 있어야 합니다.

### API 서버 상태 확인
```bash
curl http://localhost:5000/api/v1/health
```

### 지원 지침서 확인
```bash
curl http://localhost:5000/api/v1/frameworks
```

## 📖 사용 방법

### 1. 대시보드
- 전체 분석 현황 및 통계 확인
- 지원 지침서 및 장비 현황 조회
- 최근 분석 결과 요약

### 2. 파일 업로드 & 분석
1. **보안 지침서 선택**: KISA, CIS, NW 중 선택 또는 다중 선택
2. **장비 타입 선택**: 10개 브랜드 중 해당 장비 선택
3. **설정 파일 업로드**: 드래그 앤 드롭 또는 파일 선택 (최대 50MB)
4. **분석 실행**: 단일 또는 비교 분석 모드 선택

### 3. 분석 결과
- **취약점 목록**: 심각도별 필터링 및 상세 정보
- **보안 점수**: 100점 만점 점수 및 통과/실패 통계
- **비교 분석**: 여러 지침서 결과 동시 비교
- **보고서 내보내기**: JSON 형식으로 결과 다운로드

## 📄 지원 파일 형식

| 장비 브랜드 | 지원 확장자 |
|-------------|-------------|
| Cisco IOS | `.txt`, `.cfg`, `.conf` |
| Juniper JunOS | `.conf`, `.txt`, `.xml` |
| HP Networking | `.cfg`, `.txt` |
| 기타 브랜드 | `.cfg`, `.txt` |

## 🔍 분석 예시

### KISA 지침서로 Cisco 장비 분석
```bash
curl -X POST http://localhost:5000/api/v1/config-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceType": "Cisco",
    "framework": "KISA",
    "configText": "enable password cisco123\nsnmp-server community public RO",
    "options": {"checkAllRules": true}
  }'
```

### 다중 지침서 비교 분석 (웹 UI)
1. 파일 업로드 페이지에서 "다중 지침서 비교 분석" 체크
2. KISA, CIS, NW 지침서 모두 선택
3. Cisco 장비 타입 선택
4. 설정 파일 업로드 후 "비교 분석 시작" 클릭

## 📊 지침서별 특징

### KISA (38룰)
- **강점**: 한국 환경에 최적화, 종합적 보안 검사
- **심각도**: 상(14) + 중(19) + 하(5)
- **특화**: AAA, 패치 관리, 로그 관리

### CIS (11룰)
- **강점**: 글로벌 표준, 인증/권한 중심
- **심각도**: 상(6) + 중(5) + 하(0)
- **특화**: 계정 관리, 접근 제어, 로그 관리

### NW (42룰)
- **강점**: 최다 룰셋, 물리 보안 강화
- **심각도**: 상(8) + 중(30) + 하(4)
- **특화**: 기능 관리, 네트워크 접근 제어

## ⚡ 성능 및 제한사항

### 분석 성능
- **소형 설정** (< 100줄): ~0.05초
- **중형 설정** (100-1000줄): ~0.1-0.5초
- **대형 설정** (1000-5000줄): ~0.5-2초
- **초대형 설정** (> 5000줄): ~2-10초

### 제한사항
- **최대 파일 크기**: 50MB
- **동시 분석 요청**: 10개 권장
- **분석 타임아웃**: 5분
- **지원 브라우저**: Chrome, Firefox, Safari, Edge (최신 버전)

## 🔧 개발 정보

### 프로젝트 구조
```
src/
├── components/          # React 컴포넌트
│   ├── Dashboard.js    # 대시보드
│   ├── FileUpload.js   # 파일 업로드
│   ├── Header.js       # 헤더
│   ├── Sidebar.js      # 사이드바
│   └── VulnerabilityResults.js  # 결과 표시
├── services/           # API 서비스
│   └── analysisService.js  # 분석 API 클라이언트
├── App.js             # 메인 앱 컴포넌트
├── App.css            # 전역 스타일
└── index.js           # 엔트리 포인트
```

### 주요 의존성
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "tailwindcss": "^3.4.17",
  "lucide-react": "latest",
  "recharts": "latest"
}
```

### API 통신
- **Base URL**: `http://localhost:5000/api/v1`
- **인증**: 현재 버전에서는 불필요
- **요청 형식**: JSON
- **응답 형식**: JSON
- **오류 처리**: HTTP 상태 코드 + 메시지

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. API 연결 실패
```
Error: 서비스 연결에 실패했습니다
```
**해결방법**:
- API 서버가 `localhost:5000`에서 실행 중인지 확인
- 방화벽 설정 확인
- CORS 설정 확인

#### 2. 지침서 구현 오류
```
Error: NW 지침서는 아직 구현되지 않았습니다
```
**해결방법**:
- `/health` 엔드포인트로 구현된 지침서 확인
- 구현된 지침서만 사용

#### 3. 파일 업로드 실패
```
Error: 파일 크기가 너무 큽니다
```
**해결방법**:
- 파일 크기를 50MB 이하로 줄이기
- 불필요한 설정 라인 제거
- 지원되는 확장자 확인

### 로그 확인
```bash
# 개발 서버 로그
npm start

# 브라우저 개발자 도구
F12 > Console 탭

# 네트워크 요청 확인
F12 > Network 탭
```

## 🤝 기여 방법

### 1. 이슈 리포트
- [GitHub Issues](https://github.com/your-org/netsecure-analyzer/issues)에서 버그 신고
- 재현 단계와 환경 정보 포함

### 2. 기능 제안
- 새로운 지침서 추가 요청
- 장비 타입 지원 확장
- UI/UX 개선 사항

### 3. 코드 기여
1. Fork 및 Clone
2. Feature 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성

### 4. 개발 환경 설정
```bash
# ESLint 실행
npm run lint

# 테스트 실행
npm test

# 타입 체크 (TypeScript 사용 시)
npm run type-check
```

## 📚 참고 자료

### 공식 문서
- [API 명세서](./api.md)
- [KISA 가이드라인](https://www.kisa.or.kr)
- [CIS Controls](https://www.cisecurity.org)
- [NIST Framework](https://www.nist.gov/cybersecurity)

### 기술 문서
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com)
- [Create React App 문서](https://create-react-app.dev)

## 📞 지원 및 문의

### 기술 지원
- **GitHub**: [Issues 페이지](https://github.com/your-org/netsecure-analyzer/issues)
- **Wiki**: [개발자 가이드](https://github.com/your-org/netsecure-analyzer/wiki)
- **이메일**: security@example.com

### 상업적 문의
- **라이선스**: MIT
- **상업적 사용**: 자유
- **기술 지원**: 유료 지원 옵션 문의

## 🏷️ 버전 정보

### 현재 버전: v2.0.0
- ✅ KISA, CIS, NW 지침서 지원
- ✅ 10개 브랜드 장비 지원
- ✅ 다중 지침서 비교 분석
- ✅ 논리 기반 분석 엔진
- ✅ 실시간 분석 결과

### 개발 로드맵
- **v2.1**: NIST 지침서 추가
- **v2.2**: 사용자 정의 룰 생성
- **v2.3**: 자동화된 보고서 생성
- **v3.0**: AI 기반 분석 엔진

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일 참조

---

**🛡️ 보안은 선택이 아닌 필수입니다. NetSecure로 네트워크 보안을 강화하세요!**