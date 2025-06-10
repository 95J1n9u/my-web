# 🔐 reCAPTCHA v3 새로 생성하기

## 문제 상황
- Firebase App Check에서 reCAPTCHA 비밀 키가 저장되지 않음
- reCAPTCHA와 reCAPTCHA Enterprise 혼동

## 🚀 해결 방법

### 1단계: Google reCAPTCHA 콘솔에서 새 키 생성

1. **https://www.google.com/recaptcha/admin/create** 방문
2. 다음 정보 입력:
   ```
   Label: NetSecure-PhoneAuth
   reCAPTCHA type: reCAPTCHA v3
   Domains: 
     - localhost
     - 127.0.0.1
     - your-domain.com (실제 도메인)
   ```
3. **Submit** 클릭

### 2단계: 키 복사 및 저장

생성 후 나타나는 키를 복사:
```
Site key: 6L[새로운사이트키]
Secret key: 6L[새로운비밀키]
```

### 3단계: .env.local 파일 업데이트

```env
REACT_APP_DISABLE_APP_CHECK=true
REACT_APP_RECAPTCHA_SITE_KEY=[새로운사이트키]
REACT_APP_RECAPTCHA_SECRET_KEY=[새로운비밀키]
```

### 4단계: Firebase Console에서 App Check 설정

1. Firebase Console → Project Settings → App Check
2. Web apps에서 **Configure** 클릭
3. Provider: **reCAPTCHA v3** 선택
4. Site key 입력: `[새로운사이트키]`
5. **Save** 클릭

### 5단계: 테스트

1. 개발 서버 재시작: `npm start`
2. 브라우저 콘솔에서 확인:
   ```
   ✅ "App Check 비활성화 완료"
   ✅ "reCAPTCHA 설정 성공"
   ```

## 🔧 문제 해결

### reCAPTCHA vs reCAPTCHA Enterprise 차이

| 특징 | reCAPTCHA v3 | reCAPTCHA Enterprise |
|------|-------------|---------------------|
| 비용 | 무료 | 유료 |
| 설정 복잡도 | 간단 | 복잡 |
| 안정성 | 보통 | 높음 |
| Firebase 통합 | 기본 지원 | 별도 설정 필요 |

### 현재 상황에서 권장사항

1. **개발 환경**: App Check 완전 비활성화 (이미 설정됨)
2. **운영 환경**: reCAPTCHA v3 사용
3. **Enterprise**: 대용량 트래픽시에만 고려

### 추가 체크리스트

- [ ] Firebase 프로젝트가 Blaze 플랜인지 확인 (SMS 발송 필수)
- [ ] Phone Authentication이 Firebase Console에서 활성화되었는지 확인
- [ ] localhost가 Authorized domains에 추가되었는지 확인
- [ ] 브라우저 캐시 및 쿠키 삭제
- [ ] 개발 서버 재시작

## 🆘 최종 해결책

위 방법들이 모두 실패할 경우:
1. App Check를 완전히 사용하지 않음 (환경변수로 이미 설정됨)
2. Phone Authentication만 사용
3. reCAPTCHA는 Phone Auth 내부에서만 사용

현재 코드는 이미 이 방식으로 설정되어 있습니다.
