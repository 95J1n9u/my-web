# NetSecure 다중 지침서 분석기 Dockerfile
# Node.js 18 Alpine 기반 멀티스테이지 빌드

# ==========================================
# Build Stage
# ==========================================
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 메타데이터 라벨
LABEL maintainer="NetSecure Team <security@example.com>"
LABEL version="2.0.0"
LABEL description="NetSecure Multi-Framework Network Security Analyzer"

# 필수 시스템 패키지 설치
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# package.json과 package-lock.json 복사 (캐싱 최적화)
COPY package*.json ./

# 의존성 설치 (프로덕션 + 개발)
RUN npm ci --no-audit --no-fund

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드용)
ENV NODE_ENV=production
ENV REACT_APP_BUILD_ENV=production
ENV REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_ENABLE_DEVTOOLS=false

# React 앱 빌드
RUN npm run build

# 빌드 결과 확인
RUN ls -la build/

# ==========================================
# Production Stage
# ==========================================
FROM nginx:1.25-alpine AS production

# 메타데이터 설정
LABEL stage="production"

# 필수 패키지 설치
RUN apk add --no-cache \
    curl \
    bash \
    tzdata \
    && rm -rf /var/cache/apk/*

# 시간대 설정 (서울)
RUN cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone

# nginx 사용자 추가 (보안)
RUN addgroup -g 1001 -S nginx-app \
    && adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-app -g nginx-app nginx-app

# 빌드된 React 앱 복사
COPY --from=builder --chown=nginx-app:nginx-app /app/build /usr/share/nginx/html

# nginx 설정 복사
COPY --chown=nginx-app:nginx-app nginx.conf /etc/nginx/conf.d/default.conf

# nginx 메인 설정 수정
RUN sed -i 's/user  nginx;/user nginx-app;/' /etc/nginx/nginx.conf

# 로그 디렉토리 권한 설정
RUN mkdir -p /var/log/nginx \
    && chown -R nginx-app:nginx-app /var/log/nginx \
    && chown -R nginx-app:nginx-app /var/cache/nginx \
    && chown -R nginx-app:nginx-app /etc/nginx

# 헬스체크 스크립트 추가
COPY --chown=nginx-app:nginx-app healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# 환경 변수 설정
ENV NGINX_HOST=localhost
ENV NGINX_PORT=3000
ENV API_BASE_URL=http://localhost:5000/api/v1

# 포트 노출
EXPOSE 3000

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# 비특권 사용자로 실행
USER nginx-app

# nginx 시작
CMD ["nginx", "-g", "daemon off;"]

# ==========================================
# Development Stage
# ==========================================
FROM node:18-alpine AS development

WORKDIR /app

# 개발용 패키지 설치
RUN apk add --no-cache \
    git \
    bash \
    curl \
    vim

# 개발용 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 개발 환경 변수
ENV NODE_ENV=development
ENV REACT_APP_BUILD_ENV=development
ENV REACT_APP_LOG_LEVEL=debug
ENV FAST_REFRESH=true

# 포트 노출
EXPOSE 3000

# 개발 서버 시작
CMD ["npm", "start"]