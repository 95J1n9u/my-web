
import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    // ANSI 이스케이프 코드 제거 (색상, 포맷 등)
    .replace(/\x1b\[[0-9;]*m/g, '')
    // 다른 제어 문자들 제거
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // HTML 특수문자 이스케이프
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // 특수한 유니코드 문자들 정리
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Windows 줄바꿈을 Unix 형식으로 정규화
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
};

export const validateInput = (input, type = 'text') => {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    alphanumeric: /^[a-zA-Z0-9\s]+$/,
    filename: /^[a-zA-Z0-9._-]+$/,
    noScript: /^(?!.*<script).*$/i
  };
  
  return patterns[type] ? patterns[type].test(input) : true;
};