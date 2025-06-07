
class SecurityLogger {
  static logSuspiciousActivity(event, details) {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    // 콘솔 로그 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Security Event:', logData);
    }

    // 프로덕션에서는 서버로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(logData);
    }
  }

  static logFileUpload(fileName, fileSize, result) {
    this.logSuspiciousActivity('file_upload', {
      fileName,
      fileSize,
      result,
      timestamp: Date.now()
    });
  }

  static logAuthAttempt(method, success, error = null) {
    this.logSuspiciousActivity('auth_attempt', {
      method,
      success,
      error: error?.message
    });
  }

  static getCurrentUserId() {
    try {
      const session = localStorage.getItem('userSession');
      return session ? JSON.parse(session).uid : 'anonymous';
    } catch {
      return 'unknown';
    }
  }

  static async sendToServer(logData) {
    try {
      // Firebase Analytics 또는 별도 로그 서버로 전송
      console.log('Would send to server:', logData);
    } catch (error) {
      console.error('Failed to send security log:', error);
    }
  }
}

export default SecurityLogger;