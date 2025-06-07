// src/utils/validation.js (새 파일)
export const validateFileContent = (content) => {
  // 파일 크기 검증 (텍스트 기준 1MB)
  if (content.length > 1024 * 1024) {
    throw new Error('파일 내용이 너무 큽니다. (최대 1MB)');
  }

  // 의심스러운 패턴 검사
  const dangerousPatterns = [
    /rm\s+-rf/gi,           // 리눅스 삭제 명령
    /format\s+c:/gi,        // 윈도우 포맷 명령
    /\.\.\/.*\.\.\/\//g,    // 디렉토리 트래버설
    /<script[^>]*>/gi,      // 스크립트 태그
    /javascript:/gi,        // 자바스크립트 프로토콜
    /vbscript:/gi,          // VBScript 프로토콜
    /data:text\/html/gi,    // 데이터 URI 스킴
    /eval\s*\(/gi,          // eval 함수
    /document\.write/gi,    // document.write
    /window\.location/gi,   // 리다이렉션
    /\.exe(\s|$)/gi,        // 실행 파일
    /\.bat(\s|$)/gi,        // 배치 파일
    /\.cmd(\s|$)/gi,        // 명령 파일
    /\.ps1(\s|$)/gi,        // PowerShell 스크립트
    /\.sh(\s|$)/gi,         // 쉘 스크립트
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new Error('보안상 위험한 내용이 포함되어 있습니다.');
    }
  }

  // 네트워크 설정 파일 유효성 검증
  const networkConfigPatterns = [
    /interface\s+/i,
    /ip\s+address\s+/i,
    /router\s+/i,
    /access-list\s+/i,
    /vlan\s+/i,
    /hostname\s+/i,
    /version\s+/i,
    /configure\s+/i
  ];

  const hasValidNetworkConfig = networkConfigPatterns.some(pattern => 
    pattern.test(content)
  );

  if (!hasValidNetworkConfig && content.length > 100) {
    console.warn('네트워크 설정 파일 형식이 아닐 수 있습니다.');
  }

  return true;
};

export const sanitizeInput = (input) => {
  return input
    .replace(/[<>]/g, '')  // HTML 태그 제거
    .replace(/['"]/g, '')  // 따옴표 제거
    .trim();
};