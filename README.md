NetSecure - 네트워크 보안 분석 도구

다중 보안 지침서 기반 네트워크 장비 설정 파일 취약점 분석 웹 애플리케이션

📋 목차

프로젝트 소개
주요 기능
지원 장비 및 지침서
기술 스택
설치 및 실행
사용 방법
프로젝트 구조
API 문서
보안 정책
기여하기
라이선스

🚀 프로젝트 소개
NetSecure는 네트워크 인프라의 보안을 강화하기 위한 종합적인 분석 도구입니다. 네트워크 장비에서 추출한 설정 파일을 업로드하면, 다양한 국제 보안 표준에 따라 자동으로 취약점을 탐지하고 개선 방안을 제시합니다.
✨ 핵심 가치

다중 표준 지원: KISA, CIS, NW, NIST 등 다양한 보안 지침서 동시 적용
지능형 분석: 논리 기반 분석과 패턴 매칭을 결합한 고도화된 탐지 엔진
사용자 친화적: 직관적인 UI/UX와 상세한 분석 결과 제공
확장성: 10개 브랜드, 169개 보안 룰을 지원하며 지속적으로 확장

🎯 주요 기능
🔍 보안 분석

다중 지침서 분석: 여러 보안 표준을 동시에 적용하여 종합적인 보안 점검
실시간 분석: 업로드된 설정 파일에 대한 즉시 분석 및 결과 제공
상세 리포트: 취약점별 상세 설명, 위험도, 개선 방안 제시
비교 분석: 서로 다른 지침서 간의 분석 결과 비교

👤 사용자 관리

다중 인증: 이메일/비밀번호, Google OAuth 로그인 지원
권한 관리: 일반 사용자, 관리자, 중간 관리자 역할 구분
분석 기록: 개인별 분석 이력 저장 및 관리
통계 대시보드: 개인 및 시스템 전체 통계 제공

🛠 고급 기능

커뮤니티: 사용자 간 정보 공유 및 질의응답 게시판
관리자 패널: 시스템 관리, 사용자 권한 관리, 통계 조회
파일 검증: 업로드 파일의 보안 및 형식 검증
모바일 지원: 반응형 디자인으로 모든 디바이스에서 접근 가능

🔧 지원 장비 및 지침서
지원 장비 (10개 브랜드)
브랜드장비 타입지원 지침서룰 수CiscoIOS/IOS-XE 라우터, 스위치KISA, CIS, NW91룰JuniperJunOS 네트워크 장비KISA, NW60룰HPNetworking 장비NW30룰Piolink로드밸런서KISA, NW65룰RadwareAlteon 로드밸런서KISA, NW45룰NortelPassport 장비KISA, NW40룰Alteon로드밸런서KISA, NW38룰Dasan네트워크 장비NW25룰Alcatel네트워크 장비NW28룰ExtremeNetworks 장비NW25룰
보안 지침서 (4개 표준)
지침서설명룰 수특징KISA한국인터넷진흥원 네트워크 장비 보안 가이드38룰국내 표준, 종합적CISCenter for Internet Security Controls89룰실무적 보안, AAA 중심NW네트워크 보안 강화 지침서42룰강화된 점검, 최신 기준NISTNIST Cybersecurity Framework예정미국 표준 (구현 예정)
지원 파일 형식

.txt - 일반 텍스트 설정 파일
.cfg - 설정 파일
.conf - 구성 파일
.xml - XML 형식 설정 파일
.log - 로그 파일

💻 기술 스택
Frontend

React 19: 모던 컴포넌트 기반 UI 프레임워크
Tailwind CSS 3.4: 유틸리티 퍼스트 CSS 프레임워크
React Hooks: 상태 관리 및 라이프사이클 관리
React Router: 클라이언트 사이드 라우팅

Backend & Database

Firebase Auth: 사용자 인증 및 권한 관리
Firestore: NoSQL 실시간 데이터베이스
Firebase Storage: 파일 저장 (필요시)
외부 분석 API: Railway 호스팅 분석 엔진

개발 도구

ESLint: 코드 품질 관리
Prettier: 코드 포맷팅
Husky: Git 훅 관리
Bundle Analyzer: 번들 크기 최적화

보안 & 검증

DOMPurify: XSS 방지
Content Validation: 파일 내용 검증
Security Logger: 보안 이벤트 로깅
Firebase Security Rules: 데이터베이스 보안

🛠 설치 및 실행
사전 요구사항

Node.js 18.0.0 이상
npm 8.0.0 이상
Firebase 프로젝트 설정

설치
bash# 저장소 클론
git clone https://github.com/your-org/netsecure-analyzer.git
cd netsecure-analyzer

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Firebase 설정 입력
Firebase 설정

Firebase Console에서 새 프로젝트 생성
Authentication, Firestore 활성화
웹 앱 등록 후 설정 정보를 src/config/firebase.js에 입력
Firestore 보안 규칙을 firestore.rules 파일 내용으로 설정

실행
bash# 개발 서버 시작
npm start

# 프로덕션 빌드
npm run build

# 정적 서버로 빌드 결과 실행
npm run serve
기타 명령어
bash# 코드 린팅
npm run lint

# 코드 포맷팅
npm run prettier

# 테스트 실행
npm test

# 번들 크기 분석
npm run analyze
📖 사용 방법
1. 회원가입 및 로그인

이메일/비밀번호 또는 Google 계정으로 가입
이메일 인증 후 서비스 이용 가능

2. 파일 분석

장비 타입 선택: 분석할 네트워크 장비 브랜드 선택
지침서 선택: 적용할 보안 표준 선택 (다중 선택 가능)
파일 업로드: 설정 파일을 드래그 앤 드롭 또는 선택
분석 실행: 자동으로 취약점 분석 수행

3. 결과 확인

요약 대시보드: 전체 보안 점수, 취약점 수, 통과 항목 수
상세 분석: 취약점별 설명, 위험도, 개선 방안
보고서 내보내기: JSON 형식으로 분석 결과 다운로드

4. 기록 관리

분석 이력: 과거 분석 결과 조회 및 관리
통계 정보: 개인별 분석 통계 및 트렌드 확인

📁 프로젝트 구조
src/
├── components/           # React 컴포넌트
│   ├── Dashboard.js     # 대시보드 메인 화면
│   ├── FileUpload.js    # 파일 업로드 및 분석 설정
│   ├── VulnerabilityResults.js  # 분석 결과 표시
│   ├── AnalysisHistory.js       # 분석 기록 관리
│   ├── CommunityPosts.js        # 커뮤니티 게시판
│   ├── AdminPanel.js            # 관리자 패널
│   └── ...
├── services/            # 외부 API 및 서비스
│   └── analysisService.js       # 분석 API 클라이언트
├── config/              # 설정 파일
│   └── firebase.js              # Firebase 설정 및 인증
├── hooks/               # 커스텀 React 훅
│   └── useAuth.js               # 인증 관련 훅
├── utils/               # 유틸리티 함수
│   ├── validation.js            # 입력 검증
│   ├── sanitizer.js             # 데이터 정화
│   └── security-logger.js       # 보안 로깅
└── App.js               # 메인 애플리케이션 컴포넌트
🔌 API 문서
분석 엔진 API
Base URL: https://kisa-network-analyzer-production.up.railway.app/api/v1
주요 엔드포인트
javascript// 헬스 체크
GET /health

// 지원 지침서 목록
GET /frameworks

// 설정 파일 분석
POST /config-analyze
{
  "deviceType": "Cisco",
  "framework": "KISA", 
  "configText": "...",
  "options": {
    "checkAllRules": true,
    "enableLogicalAnalysis": true
  }
}

// 다중 지침서 비교 분석
POST /compare-analysis
{
  "deviceType": "Cisco",
  "frameworks": ["KISA", "CIS", "NW"],
  "configText": "..."
}
Firebase API
javascript// 사용자 인증
authService.signInWithEmail(email, password)
authService.signInWithGoogle()
authService.signUpWithEmail(email, password, displayName)

// 분석 결과 저장
authService.saveAnalysisResult(uid, analysisData)
authService.getUserAnalyses(uid, limit)

// 커뮤니티 기능
authService.createPost(uid, postData)
authService.getPosts(limit, category)
🔒 보안 정책
데이터 보호

업로드된 설정 파일은 분석 후 즉시 삭제
모든 통신은 HTTPS로 암호화
분석 결과는 사용자별로 격리 저장

파일 검증

파일 크기 제한 (최대 50MB)
허용된 확장자만 업로드 가능
악성 코드 및 위험 패턴 검사
입력 데이터 무결성 검증

접근 제어

Firebase Security Rules 기반 권한 관리
역할 기반 접근 제어 (RBAC)
세션 관리 및 자동 로그아웃

🤝 기여하기
프로젝트 기여를 환영합니다! 다음 방법으로 참여할 수 있습니다:
개발 참여

저장소 포크
기능 브랜치 생성 (git checkout -b feature/AmazingFeature)
변경사항 커밋 (git commit -m 'Add some AmazingFeature')
브랜치에 푸시 (git push origin feature/AmazingFeature)
Pull Request 생성

이슈 리포팅

버그 리포트
기능 요청
보안 이슈 (private 이슈로 등록)

문서 개선

README 개선
API 문서 업데이트
사용자 가이드 작성

📞 지원 및 문의

이메일: support@netsecure.com
고객센터: 1588-0000 (평일 09:00-18:00)
GitHub Issues: 프로젝트 이슈 페이지

📄 라이선스
이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 LICENSE 파일을 참조하세요.

NetSecure - 네트워크 보안의 새로운 기준을 제시합니다.
© 2024 NetSecure Team. All rights reserved.