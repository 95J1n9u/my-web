// 🔥 개발용 헬퍼 함수들
// 개발 환경에서만 사용되는 유틸리티 함수들

/**
 * 개발용 자동 로그인
 * SMS 인증 문제를 우회하기 위한 임시 해결책
 */
export const devAutoLogin = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('개발 환경에서만 사용 가능합니다.');
    return { success: false, error: '개발 환경에서만 사용 가능합니다.' };
  }

  const skipAuth = process.env.REACT_APP_SKIP_SMS_AUTH === 'true';
  const autoLogin = process.env.REACT_APP_DEV_AUTO_LOGIN === 'true';
  
  if (!skipAuth && !autoLogin) {
    return { success: false, error: '자동 로그인이 비활성화되어 있습니다.' };
  }

  try {
    const { authService } = await import('../config/firebase');
    
    // 환경변수에서 테스트 계정 정보 가져오기
    const testEmail = process.env.REACT_APP_DEV_TEST_EMAIL || 'dev@netsecure.local';
    const testPassword = process.env.REACT_APP_DEV_TEST_PASSWORD || 'dev123456789';
    
    console.log('🔥 개발용 자동 로그인 시도:', testEmail);
    
    // 먼저 로그인 시도
    let result = await authService.signInWithEmail(testEmail, testPassword);
    
    if (!result.success) {
      // 로그인 실패 시 계정 생성 시도
      console.log('🔥 테스트 계정이 없어서 생성 시도');
      
      const signupResult = await authService.signUpWithEmail(
        testEmail,
        testPassword,
        '개발자 테스트 계정',
        null // 휴대폰 번호 없음
      );
      
      if (signupResult.success) {
        console.log('🔥 테스트 계정 생성 성공, 다시 로그인 시도');
        result = await authService.signInWithEmail(testEmail, testPassword);
      } else {
        throw new Error(`계정 생성 실패: ${signupResult.error}`);
      }
    }
    
    if (result.success) {
      console.log('✅ 개발용 자동 로그인 성공:', result.user);
      return {
        success: true,
        user: result.user,
        isDev: true
      };
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('❌ 개발용 자동 로그인 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 개발용 테스트 데이터 생성
 */
export const createDevTestData = async (user) => {
  if (process.env.NODE_ENV !== 'development' || !user?.uid) {
    return { success: false, error: '개발 환경과 사용자가 필요합니다.' };
  }
  
  try {
    const { authService } = await import('../config/firebase');
    
    // 테스트용 분석 결과 생성
    const testAnalysisData = {
      deviceType: 'Cisco',
      framework: 'KISA',
      fileName: 'test-config.txt',
      fileSize: 1024,
      isComparison: false,
      comparisonFrameworks: null,
      summary: {
        totalChecks: 38,
        vulnerabilities: 5,
        highSeverity: 1,
        mediumSeverity: 2,
        lowSeverity: 2,
        passed: 33,
        securityScore: 87
      },
      metadata: {
        analysisTime: 2.5,
        engineVersion: 'Dev Test',
        totalLines: 150,
        deviceType: 'Cisco',
        framework: 'KISA'
      },
      vulnerabilities: [
        {
          id: 'test-vuln-1',
          severity: 'High',
          type: 'Authentication',
          description: '테스트용 취약점 - 기본 비밀번호 사용',
          ruleId: 'KISA-AUTH-001',
          framework: 'KISA',
          line: 15
        },
        {
          id: 'test-vuln-2',
          severity: 'Medium',
          type: 'Access Control',
          description: '테스트용 취약점 - SSH 접근 제어 미설정',
          ruleId: 'KISA-ACCESS-003',
          framework: 'KISA',
          line: 42
        }
      ]
    };
    
    const saveResult = await authService.saveAnalysisResult(user.uid, testAnalysisData);
    
    if (saveResult.success) {
      console.log('✅ 테스트 데이터 생성 성공');
      return { success: true, analysisId: saveResult.analysisId };
    } else {
      throw new Error(saveResult.error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 데이터 생성 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 개발용 네트워크 장비 설정 파일 샘플 생성
 */
export const generateSampleConfigFile = (deviceType = 'Cisco') => {
  const samples = {
    Cisco: `!
version 15.2
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname CISCO-ROUTER-01
!
boot-start-marker
boot-end-marker
!
enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
!
no aaa new-model
!
ip domain name company.local
ip name-server 8.8.8.8
ip name-server 8.8.4.4
!
interface GigabitEthernet0/0
 description WAN Connection
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
interface GigabitEthernet0/1
 description LAN Connection
 ip address 10.0.1.1 255.255.255.0
 no shutdown
!
router ospf 1
 log-adjacency-changes
 network 10.0.1.0 0.0.0.255 area 0
 network 192.168.1.0 0.0.0.255 area 0
!
ip forward-protocol nd
!
ip http server
ip http authentication local
!
logging 192.168.1.100
!
snmp-server community public RO
snmp-server community private RW
!
line con 0
 password cisco
 login
line vty 0 4
 password cisco
 login
 transport input telnet ssh
!
end`,
    
    Juniper: `system {
    host-name JUNIPER-SRX-01;
    domain-name company.local;
    time-zone Asia/Seoul;
    root-authentication {
        encrypted-password "$1$mERr$hx5rVt7rPNoS4wqbXKX7m0";
    }
    name-server {
        8.8.8.8;
        8.8.4.4;
    }
    services {
        ssh;
        telnet;
        web-management {
            http {
                interface all;
            }
        }
    }
    syslog {
        user * {
            any emergency;
        }
        file messages {
            any notice;
            authorization info;
        }
        file interactive-commands {
            interactive-commands any;
        }
    }
}

interfaces {
    ge-0/0/0 {
        description "WAN Connection";
        unit 0 {
            family inet {
                address 192.168.1.1/24;
            }
        }
    }
    ge-0/0/1 {
        description "LAN Connection";
        unit 0 {
            family inet {
                address 10.0.1.1/24;
            }
        }
    }
}

security {
    policies {
        from-zone trust to-zone untrust {
            policy default-permit {
                match {
                    source-address any;
                    destination-address any;
                    application any;
                }
                then {
                    permit;
                }
            }
        }
    }
    zones {
        security-zone trust {
            interfaces {
                ge-0/0/1.0;
            }
        }
        security-zone untrust {
            interfaces {
                ge-0/0/0.0;
            }
        }
    }
}

routing-options {
    static {
        route 0.0.0.0/0 next-hop 192.168.1.254;
    }
}`
  };
  
  return samples[deviceType] || samples.Cisco;
};

/**
 * 개발용 파일 다운로드 헬퍼
 */
export const downloadSampleFile = (deviceType = 'Cisco', filename = null) => {
  const content = generateSampleConfigFile(deviceType);
  const finalFilename = filename || `sample-${deviceType.toLowerCase()}-config.txt`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ ${deviceType} 샘플 설정 파일 다운로드: ${finalFilename}`);
};

/**
 * 개발용 상태 확인
 */
export const getDevStatus = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const skipAuth = process.env.REACT_APP_SKIP_SMS_AUTH === 'true';
  const autoLogin = process.env.REACT_APP_DEV_AUTO_LOGIN === 'true';
  
  return {
    isDevelopment: isDev,
    skipSmsAuth: skipAuth,
    autoLoginEnabled: autoLogin,
    testEmail: process.env.REACT_APP_DEV_TEST_EMAIL,
    features: {
      autoLogin: isDev && autoLogin,
      skipAuth: isDev && skipAuth,
      sampleFiles: isDev,
      testData: isDev
    }
  };
};

// 개발용 알림 표시
export const showDevNotification = (message, type = 'info') => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const colors = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    error: 'bg-red-100 border-red-500 text-red-700'
  };
  
  // 간단한 토스트 알림 생성
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 left-4 p-4 border-l-4 rounded-lg shadow-lg z-50 max-w-md ${colors[type]}`;
  toast.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        🔧
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">개발 모드</p>
        <p class="text-sm">${message}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

export default {
  devAutoLogin,
  createDevTestData,
  generateSampleConfigFile,
  downloadSampleFile,
  getDevStatus,
  showDevNotification
};
