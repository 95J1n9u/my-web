# 넷시큐어 (NetSecure)

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-2.2.19-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/API-v1.3.0-0088CC?style=flat-square" alt="API" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
</div>

<p align="center">
  <b>다중 보안 지침 기반 네트워크 장비 설정 취약점 분석 플랫폼</b>
</p>

## 📋 프로젝트 소개

넷시큐어는 네트워크 장비의 설정 파일을 분석하여 여러 보안 지침(KISA, CIS, NIST 등)에 기반한 취약점을 자동으로 탐지하고 해결 방안을 제시하는 웹 애플리케이션입니다. 관리자는 직관적인 대시보드를 통해 네트워크 장비의 보안 상태를 모니터링하고 개선할 수 있습니다.

### 🔍 주요 기능

- **다중 보안 지침 지원**: KISA(한국인터넷진흥원), CIS(Center for Internet Security), NIST(National Institute of Standards and Technology) 등 다양한 보안 지침 기반 분석
- **자동 취약점 탐지**: 지침별 룰셋 기반 자동 분석 (KISA: 38개 룰셋)
- **다양한 장비 지원**: Cisco, Juniper, Radware 등 주요 네트워크 장비 설정 파일 분석
- **심각도 분류**: 취약점을 고/중/저 심각도로 분류하여 우선순위 설정
- **상세 보고서**: 발견된 취약점에 대한 상세 설명 및 해결 방안 제공
- **보안 점수**: 설정 파일의 전반적인 보안 수준을 점수로 표시
- **지침 비교**: 서로 다른 보안 지침 간의 분석 결과 비교

## 🚀 시작하기

### 사전 요구사항

- Node.js 14.0.0 이상
- npm 또는 yarn
- 분석 API 서버 접속 정보 (기본값: `https://kisa-network-analyzer-production.up.railway.app/api/v1`)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/netsecure.git
cd netsecure

# 의존성 설치
npm install
# 또는
yarn install
```

### 환경 설정

`.env` 파일을 생성하고 다음 내용을 추가합니다:

```
REACT_APP_API_BASE_URL=https://kisa-network-analyzer-production.up.railway.app/api/v1
```

### 개발 서버 실행

```bash
npm start
# 또는
yarn start
```

브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
# 또는
yarn build
```

## 📊 사용 방법

1. **대시보드** 탭에서 전체 분석 현황 확인
2. **파일 업로드** 탭에서 장비 타입과 분석할 보안 지침 선택 후 설정 파일 업로드
3. **분석 결과** 탭에서 발견된 취약점 확인 및 권장 조치 사항 검토
4. 필요시 보고서 내보내기로 분석 결과 저장

### 지원 보안 지침

- **KISA** (한국인터넷진흥원): ✅ 완전 구현 (38개 룰셋)
- **CIS** (Center for Internet Security): 🚧 구현 예정
- **NIST** (National Institute of Standards and Technology): 🚧 계획 중
- **ISO/IEC 27001**: 🚧 계획 중
- **PCI DSS**: 🚧 계획 중

### 지원 파일 형식

- Cisco IOS/IOS-XE: `.txt`, `.cfg`, `.conf`
- Juniper JunOS: `.conf`, `.txt`, `.xml`
- Radware Alteon: `.cfg`, `.txt`
- Nortel Passport: `.cfg`, `.txt`
- Piolink: `.cfg`, `.txt`

## 🛠️ 기술 스택

- **프론트엔드**: React, Tailwind CSS
- **백엔드 API**: 멀티 프레임워크 네트워크 장비 취약점 분석 API (v1.3.0)
- **상태 관리**: React Hooks (useState, useEffect)

## 📦 프로젝트 구조

```
netsecure/
├── public/               # 정적 파일
├── src/
│   ├── components/       # 리액트 컴포넌트
│   │   ├── Dashboard.js          # 대시보드 화면
│   │   ├── FileUpload.js         # 파일 업로드 화면
│   │   ├── Header.js             # 헤더 컴포넌트
│   │   ├── Sidebar.js            # 사이드바 네비게이션
│   │   └── VulnerabilityResults.js # 취약점 결과 화면
│   ├── services/         # API 서비스
│   │   └── analysisService.js    # 분석 API 연동
│   ├── App.js            # 메인 앱 컴포넌트
│   ├── App.css           # 메인 스타일
│   └── index.js          # 앱 진입점
└── README.md             # 프로젝트 문서
```

## 🔐 보안 정책

- 업로드된 모든 파일은 분석 후 즉시 삭제되며 서버에 저장되지 않습니다.
- 모든 통신은 HTTPS로 암호화되어 전송됩니다.
- 사용자 인증 및 권한 관리 기능은 별도 구현이 필요합니다.

## 📈 보안 지침 구현 현황

| 지침 | 상태 | 룰셋 수 | 참고 |
|------|------|---------|------|
| KISA | ✅ 완전 구현 | 38개 | 한국인터넷진흥원 네트워크 장비 보안 가이드 |
| CIS | 🚧 구현 예정 | 예정 | CIS Controls v8 |
| NIST | 🚧 계획 중 | 예정 | NIST SP 800-53 |
| ISO/IEC 27001 | 🚧 계획 중 | 예정 | ISO/IEC 27001:2022 |
| PCI DSS | 🚧 계획 중 | 예정 | PCI DSS v4.0 |

## 🚀 향후 계획

- [ ] CIS, NIST 등 추가 보안 지침 구현
- [ ] 지침 간 비교 분석 기능 추가
- [ ] 사용자 인증 및 권한 관리 추가
- [ ] 다국어 지원 (영어, 일본어 등)
- [ ] 취약점 통계 및 트렌드 분석 기능
- [ ] 대시보드 커스터마이징 옵션
- [ ] 보안 점검 일정 관리 및 알림 기능

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트 관리자: 이메일 주소 또는 연락처 정보

---

<p align="center">Made with ❤️ for better network security</p>