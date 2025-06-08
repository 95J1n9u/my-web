const API_BASE_URL =
  'https://kisa-network-analyzer-production.up.railway.app/api/v1';

class AnalysisService {
  // 헬스 체크 (다중 지침서 정보 포함)
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      // implementedFrameworks에 NW가 포함되도록 보장
      if (
        data.implementedFrameworks &&
        !data.implementedFrameworks.includes('NW')
      ) {
        data.implementedFrameworks = [
          ...(data.implementedFrameworks || []),
          'NW',
        ];
      }

      return data;
    } catch (error) {
      throw new Error('서비스 연결에 실패했습니다: ' + error.message);
    }
  }

  // 지원되는 보안 지침서 목록 조회
  async getFrameworks() {
    try {
      const response = await fetch(`${API_BASE_URL}/frameworks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // NW 지침서가 구현됨으로 표시되도록 보장
      if (data.frameworks) {
        data.frameworks = data.frameworks.map(framework => {
          if (framework.id === 'NW') {
            return {
              ...framework,
              isImplemented: true,
              status: 'active',
            };
          }
          return framework;
        });
      }

      return data;
    } catch (error) {
      // API 실패 시 로컬 기본값 반환 (NW 포함)
      return {
        success: true,
        totalFrameworks: 4,
        implementedFrameworks: 3,
        frameworks: [
          {
            id: 'KISA',
            name: 'KISA 네트워크 장비 보안 가이드',
            description:
              '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
            isImplemented: true,
            status: 'active',
            total_rules: 38,
            version: '2024',
          },
          {
            id: 'CIS',
            name: 'CIS Controls',
            description: 'Center for Internet Security Controls',
            isImplemented: true,
            status: 'active',
            total_rules: 11,
            version: 'v8',
          },
          {
            id: 'NW',
            name: 'NW 네트워크 보안 지침서',
            description: '네트워크 보안 강화 지침서',
            isImplemented: true, // NW를 구현됨으로 설정
            status: 'active',
            total_rules: 42,
            version: '2024',
          },
          {
            id: 'NIST',
            name: 'NIST Cybersecurity Framework',
            description:
              'National Institute of Standards and Technology Cybersecurity Framework',
            isImplemented: false,
            status: 'planned',
            total_rules: 0,
            version: '2.0',
          },
        ],
      };
    }
  }

  // 특정 지침서의 룰 목록 조회
  async getFrameworkRules(frameworkId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.includeExamples)
        queryParams.append('includeExamples', options.includeExamples);
      if (options.deviceType)
        queryParams.append('deviceType', options.deviceType);
      if (options.severity) queryParams.append('severity', options.severity);

      const url = `${API_BASE_URL}/frameworks/${frameworkId}/rules${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('지침서 룰 조회에 실패했습니다: ' + error.message);
    }
  }

  // 지원 장비 타입 조회
  async getDeviceTypes(framework = 'KISA') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/device-types?framework=${framework}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load device types:', error);
      // 기본값 설정 - 새로운 API 명세서에 따른 확장된 장비 타입
      return {
        success: true,
        framework: framework,
        deviceTypes: [
          'Cisco',
          'Juniper',
          'HP',
          'Piolink',
          'Radware',
          'Passport',
          'Alteon',
          'Dasan',
          'Alcatel',
          'Extreme',
        ],
      };
    }
  }

  // 룰 목록 조회
  async getRules(framework = 'KISA', options = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('framework', framework);
      if (options.includeExamples)
        queryParams.append('includeExamples', options.includeExamples);
      if (options.deviceType)
        queryParams.append('deviceType', options.deviceType);
      if (options.severity) queryParams.append('severity', options.severity);

      const response = await fetch(
        `${API_BASE_URL}/rules?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('룰 목록 조회에 실패했습니다: ' + error.message);
    }
  }

  // 특정 룰 상세 정보 조회
  async getRuleDetail(ruleId, framework = 'KISA', includeExamples = true) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('framework', framework);
      queryParams.append('includeExamples', includeExamples);

      const response = await fetch(
        `${API_BASE_URL}/rules/${ruleId}?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('룰 상세 정보 조회에 실패했습니다: ' + error.message);
    }
  }

  // 설정 파일 분석
  async analyzeConfig(
  deviceType,
  configText,
  framework = 'KISA',
  options = {},
  analysisOptions = {}
) {
  try {
    const requestBody = {
      deviceType,
      framework,
      configText,
      options: {
        checkAllRules: true,
        returnRawMatches: false,
        enableLogicalAnalysis: true,
        includeRecommendations: true,
        // 🔥 새로운 분석 옵션들 추가
        includePassedRules: analysisOptions.includePassedRules || false,
        includeSkippedRules: analysisOptions.includeSkippedRules || false,
        useConsolidation: analysisOptions.useConsolidation !== false, // 기본값 true
        showDetailedInfo: analysisOptions.showDetailedInfo !== false, // 기본값 true
        enableComplianceMode: analysisOptions.enableComplianceMode || false,
        ...options,
      },
    };

    // 컴플라이언스 모드가 활성화된 경우 전용 엔드포인트 사용
    const endpoint = analysisOptions.enableComplianceMode 
      ? `${API_BASE_URL}/config-analyze/compliance`
      : `${API_BASE_URL}/config-analyze`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 400) {
        throw new Error(errorData?.error || '잘못된 요청 데이터입니다');
      } else if (response.status === 413) {
        throw new Error('설정 파일이 너무 큽니다 (최대 50MB)');
      } else if (response.status === 429) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요');
      } else if (response.status === 501) {
        throw new Error(
          errorData?.error ||
            `${framework} 지침서는 아직 구현되지 않았습니다.`
        );
      } else {
        throw new Error(errorData?.error || `서버 오류: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error(
        '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.'
      );
    }
    throw error;
  }
}

  // 단일 라인 분석
  async analyzeLine(line, deviceType, framework = 'KISA', ruleIds = null) {
    try {
      const requestBody = {
        line,
        deviceType,
        framework,
        ...(ruleIds && { ruleIds }),
      };

      const response = await fetch(`${API_BASE_URL}/analyze-line`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('라인 분석에 실패했습니다: ' + error.message);
    }
  }

  // 다중 지침서 비교 분석
  async compareAnalysis(
    deviceType,
    configText,
    frameworks = ['KISA', 'CIS', 'NW'],
    options = {}
  ) {
    try {
      // 순차적으로 각 지침서 분석 후 결과 병합
      const results = {};
      for (const framework of frameworks) {
        try {
          results[framework] = await this.analyzeConfig(
            deviceType,
            configText,
            framework,
            options
          );
        } catch (error) {
          results[framework] = { error: error.message, success: false };
        }
      }

      // 비교 분석 결과 생성
      return this.generateComparisonResult(results, frameworks);
    } catch (error) {
      throw new Error('비교 분석에 실패했습니다: ' + error.message);
    }
  }

  // 비교 분석 결과 생성 헬퍼
  generateComparisonResult(results, frameworks) {
    const comparison = {
      frameworks: results,
      summary: {
        totalFrameworks: frameworks.length,
        successfulAnalyses: 0,
        totalIssues: 0,
        commonIssues: 0,
        uniqueByFramework: {},
      },
      metadata: {
        timestamp: new Date().toISOString(),
        comparedFrameworks: frameworks,
      },
    };

    // 성공한 분석 결과 처리
    const successfulResults = {};
    for (const [framework, result] of Object.entries(results)) {
      if (result.success) {
        comparison.summary.successfulAnalyses++;
        comparison.summary.totalIssues += result.issuesFound || 0;
        comparison.summary.uniqueByFramework[framework] =
          result.issuesFound || 0;
        successfulResults[framework] = result;
      }
    }

    return comparison;
  }

  // 설정 파일 문법 검증
  async validateConfig(deviceType, configText) {
    try {
      const response = await fetch(`${API_BASE_URL}/config-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceType,
          configText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('설정 파일 검증에 실패했습니다: ' + error.message);
    }
  }

  // 통계 정보 조회
  async getStatistics(framework = 'KISA') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/statistics?framework=${framework}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('통계 정보 조회에 실패했습니다: ' + error.message);
    }
  }

  // 파일을 텍스트로 변환
  async fileToText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('파일 읽기에 실패했습니다'));
      reader.readAsText(file, 'UTF-8');
    });
  }

// 분석 결과를 UI용 형식으로 변환
transformAnalysisResult(apiResult) {
  if (!apiResult.success) {
    throw new Error(apiResult.error || '분석에 실패했습니다');
  }

  // 심각도 매핑 (기존과 동일)
  const severityMapping = {
    상: 'High',
    중: 'Medium',
    하: 'Low',
    Critical: 'Critical',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
    Moderate: 'Medium',
  };

  // 카테고리 매핑 (기존과 동일)
  const categoryMapping = {
    '계정 관리': 'Authentication',
    '접근 관리': 'Access Control',
    '기능 관리': 'Function Management',
    '로그 관리': 'Log Management',
    '패치 관리': 'Patch Management',
    'Inventory and Control': 'Asset Management',
    'Configuration Management': 'Configuration',
    'Access Control': 'Access Control',
    'Secure Configuration': 'Configuration',
    비밀번호: 'Authentication',
    '네트워크 접근': 'Access Control',
    '서비스 관리': 'Function Management',
    Identify: 'Identification',
    Protect: 'Protection',
    Detect: 'Detection',
    Respond: 'Response',
    Recover: 'Recovery',
  };

  // 결과 변환 함수
  const transformResults = (results, status) => {
    if (!results || !Array.isArray(results)) return [];
    
    return results.map((result, index) => ({
      id: `${status}_${index + 1}`,
      severity: severityMapping[result.severity] || result.severity,
      severityKo: result.severity,
      type: categoryMapping[result.category] || result.category,
      typeKo: result.category,
      description: result.description,
      recommendation: result.recommendation,
      line: result.line,
      matchedText: result.matchedText,
      ruleId: result.ruleId,
      reference: result.reference,
      framework: result.framework || apiResult.framework,
      analysisType: result.analysisType || 'logical',
      status: status, // 상태 정보
    }));
  };

  // 🔥 새로운 결과 구조 처리 - 수정된 부분
  let vulnerabilities = [];
  let passedRules = [];
  let skippedRules = [];

  // API 응답 구조에 따른 분기 처리
  if (apiResult.results) {
    if (typeof apiResult.results === 'object' && !Array.isArray(apiResult.results)) {
      // 새로운 구조: {failed: [], passed: [], skipped: []}
      vulnerabilities = transformResults(apiResult.results.failed || [], 'failed');
      passedRules = transformResults(apiResult.results.passed || [], 'passed');
      skippedRules = transformResults(apiResult.results.skipped || [], 'skipped');
    } else if (Array.isArray(apiResult.results)) {
      // 기존 구조: 배열 형태
      vulnerabilities = transformResults(apiResult.results, 'failed');
    }
  }

  // 별도 필드에서 오는 경우도 처리
  if (apiResult.passedRules && Array.isArray(apiResult.passedRules)) {
    passedRules = transformResults(apiResult.passedRules, 'passed');
  }
  if (apiResult.skippedRules && Array.isArray(apiResult.skippedRules)) {
    skippedRules = transformResults(apiResult.skippedRules, 'skipped');
  }
// 🔥 complianceSummary 안전하게 처리
const safeComplianceSummary = apiResult.complianceSummary ? {
  ...apiResult.complianceSummary,
  severityBreakdown: apiResult.complianceSummary.severityBreakdown && 
                     typeof apiResult.complianceSummary.severityBreakdown === 'object' &&
                     !Array.isArray(apiResult.complianceSummary.severityBreakdown) ? 
                     apiResult.complianceSummary.severityBreakdown : {},
  categoryBreakdown: apiResult.complianceSummary.categoryBreakdown && 
                     typeof apiResult.complianceSummary.categoryBreakdown === 'object' &&
                     !Array.isArray(apiResult.complianceSummary.categoryBreakdown) ? 
                     apiResult.complianceSummary.categoryBreakdown : {}
} : null;
  // 변환된 결과 반환
  const transformedResult = {
    summary: {
      totalChecks: apiResult.statistics?.totalRulesChecked || 
                   apiResult.analysisDetails?.rulesApplied || 
                   apiResult.complianceSummary?.totalRules || 0,
      vulnerabilities: apiResult.issuesFound || 
                      apiResult.complianceSummary?.failedRules || 
                      vulnerabilities.length || 0,
      warnings: apiResult.statistics?.mediumSeverityIssues || 0,
      passed: apiResult.passedRulesCount || 
              apiResult.statistics?.rulesPassed || 
              apiResult.complianceSummary?.passedRules || 
              passedRules.length || 0,
      skipped: apiResult.skippedRulesCount || 
               apiResult.complianceSummary?.skippedRules || 
               skippedRules.length || 0,
      highSeverity: apiResult.statistics?.highSeverityIssues || 0,
      mediumSeverity: apiResult.statistics?.mediumSeverityIssues || 0,
      lowSeverity: apiResult.statistics?.lowSeverityIssues || 0,
      // 컴플라이언스 정보 추가
      complianceRate: apiResult.complianceSummary?.complianceRate || null,
    },
    vulnerabilities: vulnerabilities,
    // 새로운 결과 타입들 추가
    passedRules: passedRules,
    skippedRules: skippedRules,
    metadata: {
      deviceType: apiResult.deviceType,
      framework: apiResult.framework,
      frameworkInfo: apiResult.frameworkInfo,
      totalLines: apiResult.totalLines,
      analysisTime: apiResult.analysisTime,
      timestamp: apiResult.timestamp,
      engineVersion: apiResult.engineVersion,
      contextInfo: apiResult.contextInfo,
      analysisDetails: apiResult.analysisDetails,
      // 컴플라이언스 메타데이터 추가
      complianceSummary: safeComplianceSummary,
    analysisOptions: apiResult.analysisOptions,
    },
  };

  return transformedResult;
}

  // 지침서별 특성 정보 반환 (업데이트된 버전)
  getFrameworkInfo(frameworkId) {
    const frameworkDetails = {
      KISA: {
        name: 'KISA 네트워크 장비 보안 가이드',
        description:
          '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
        country: 'KR',
        organization: '한국인터넷진흥원',
        severityLevels: ['상', '중', '하'],
        categories: [
          '계정 관리',
          '접근 관리',
          '패치 관리',
          '로그 관리',
          '기능 관리',
        ],
        color: '#0066CC',
        isImplemented: true,
        totalRules: 38,
      },
      CIS: {
        name: 'CIS Controls',
        description: 'Center for Internet Security Controls',
        country: 'US',
        organization: 'Center for Internet Security',
        severityLevels: ['Critical', 'High', 'Medium', 'Low'],
        categories: ['계정 관리', '접근 관리', '로그 관리'],
        color: '#FF6B35',
        isImplemented: true,
        totalRules: 11,
      },
      NW: {
        name: 'NW 네트워크 보안 지침서',
        description: '네트워크 보안 강화 지침서',
        country: 'KR',
        organization: 'NW Security',
        severityLevels: ['상', '중', '하'],
        categories: [
          '계정 관리',
          '접근 관리',
          '기능 관리',
          '로그 관리',
          '패치 관리',
        ],
        color: '#28A745',
        isImplemented: true, // NW를 구현됨으로 설정
        totalRules: 42,
      },
      NIST: {
        name: 'NIST Cybersecurity Framework',
        description:
          'National Institute of Standards and Technology Cybersecurity Framework',
        country: 'US',
        organization: 'NIST',
        severityLevels: ['High', 'Moderate', 'Low'],
        categories: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
        color: '#6F42C1',
        isImplemented: false,
        totalRules: 0,
      },
    };

    return frameworkDetails[frameworkId] || null;
  }

  // 지원 장비 타입 정보 반환
  getDeviceTypeInfo() {
    return {
      Cisco: {
        name: 'Cisco IOS/IOS-XE',
        description: 'Cisco 라우터, 스위치',
        supportedFrameworks: ['KISA', 'CIS', 'NW'],
        maxRules: 91,
      },
      Juniper: {
        name: 'Juniper JunOS',
        description: 'Juniper 네트워크 장비',
        supportedFrameworks: ['KISA', 'NW'],
        maxRules: 60,
      },
      HP: {
        name: 'HP Networking',
        description: 'HP 네트워크 장비',
        supportedFrameworks: ['NW'],
        maxRules: 30,
      },
      Piolink: {
        name: 'Piolink',
        description: 'Piolink 로드밸런서',
        supportedFrameworks: ['KISA', 'NW'],
        maxRules: 65,
      },
      Radware: {
        name: 'Radware Alteon',
        description: 'Radware 로드밸런서',
        supportedFrameworks: ['KISA', 'NW'],
        maxRules: 45,
      },
      Passport: {
        name: 'Nortel Passport',
        description: 'Nortel/Avaya 장비',
        supportedFrameworks: ['KISA', 'NW'],
        maxRules: 40,
      },
      Alteon: {
        name: 'Alteon',
        description: 'Alteon 로드밸런서',
        supportedFrameworks: ['KISA', 'NW'],
        maxRules: 38,
      },
      Dasan: {
        name: 'Dasan',
        description: 'Dasan 네트워크 장비',
        supportedFrameworks: ['NW'],
        maxRules: 25,
      },
      Alcatel: {
        name: 'Alcatel',
        description: 'Alcatel 네트워크 장비',
        supportedFrameworks: ['NW'],
        maxRules: 28,
      },
      Extreme: {
        name: 'Extreme Networks',
        description: 'Extreme 네트워크 장비',
        supportedFrameworks: ['NW'],
        maxRules: 25,
      },
    };
  }
// AI 기반 취약점 조치 방안 분석
  async getAIRemediation(configText, vulnerabilityReport, aiApiBaseUrl = 'https://vulnerability-resolution-ai-production.up.railway.app') {
    try {
      console.log('=== AI API Request Debug ===');
      console.log('AI API URL:', `${aiApiBaseUrl}/analyze-vulnerabilities`);
      console.log('Config text length:', configText.length);
      console.log('Config text preview:', configText.substring(0, 200) + '...');
      console.log('Vulnerability report structure:', {
        type: typeof vulnerabilityReport,
        keys: Object.keys(vulnerabilityReport),
        vulnerabilities_count: vulnerabilityReport.vulnerabilities?.length,
        metadata_keys: Object.keys(vulnerabilityReport.metadata || {})
      });

      // 요청 데이터 구성 및 검증
      const requestBody = {
        original_config: configText,
        vulnerability_report: vulnerabilityReport
      };

      // 데이터 검증
      if (!requestBody.original_config || typeof requestBody.original_config !== 'string') {
        throw new Error('original_config must be a non-empty string');
      }

      if (!requestBody.vulnerability_report || typeof requestBody.vulnerability_report !== 'object') {
        throw new Error('vulnerability_report must be an object');
      }

      if (!Array.isArray(requestBody.vulnerability_report.vulnerabilities)) {
        throw new Error('vulnerability_report.vulnerabilities must be an array');
      }

      if (!requestBody.vulnerability_report.metadata || typeof requestBody.vulnerability_report.metadata !== 'object') {
        throw new Error('vulnerability_report.metadata must be an object');
      }

      console.log('=== Request Body Validation ===');
      console.log('✓ original_config: string,', requestBody.original_config.length, 'chars');
      console.log('✓ vulnerability_report: object');
      console.log('✓ vulnerabilities: array,', requestBody.vulnerability_report.vulnerabilities.length, 'items');
      console.log('✓ metadata: object,', Object.keys(requestBody.vulnerability_report.metadata).length, 'keys');

      // 각 취약점 데이터 상세 검증
      requestBody.vulnerability_report.vulnerabilities.forEach((vuln, index) => {
        console.log(`Vulnerability ${index}:`, {
          id: vuln.id,
          severity: vuln.severity,
          ruleId: vuln.ruleId,
          description_length: vuln.description?.length,
          type: vuln.type,
          line: vuln.line,
          recommendation_length: vuln.recommendation?.length
        });

        // 필수 필드 검증
        if (!vuln.id || typeof vuln.id !== 'string') {
          throw new Error(`Vulnerability ${index}: id must be a string`);
        }
        if (!vuln.severity || typeof vuln.severity !== 'string') {
          throw new Error(`Vulnerability ${index}: severity must be a string`);
        }
        if (!vuln.description || typeof vuln.description !== 'string') {
          throw new Error(`Vulnerability ${index}: description must be a string`);
        }
      });

      // JSON 직렬화 테스트
      let jsonString;
      try {
        jsonString = JSON.stringify(requestBody);
        console.log('✓ JSON serialization successful, length:', jsonString.length);
      } catch (jsonError) {
        console.error('✗ JSON serialization failed:', jsonError);
        throw new Error('요청 데이터를 JSON으로 변환할 수 없습니다: ' + jsonError.message);
      }

      console.log('=== Sending Request ===');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Content-Length': jsonString.length
      });

      const response = await fetch(`${aiApiBaseUrl}/analyze-vulnerabilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString,
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('AI API Error Response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          errorData = { detail: errorText };
        }

        if (response.status === 422) {
          console.error('=== 422 Validation Error Details ===');
          
          let detailMessage = '데이터 형식 검증 실패:\n';
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorData.detail.forEach(err => {
                console.error('Validation error:', err);
                detailMessage += `\n• ${err.loc?.join('.')} 필드: ${err.msg}`;
                if (err.input) {
                  detailMessage += ` (입력값: ${JSON.stringify(err.input).substring(0, 100)})`;
                }
              });
            } else {
              detailMessage += `\n• ${errorData.detail}`;
            }
          } else {
            detailMessage += '\n• 상세 오류 정보를 받을 수 없습니다.';
          }
          
          throw new Error(detailMessage);
        } else if (response.status === 400) {
          throw new Error(errorData?.detail || '잘못된 요청 데이터입니다');
        } else if (response.status === 500) {
          throw new Error('AI 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(errorData?.detail || `AI API 오류: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('✓ AI 조치 방안 응답 받음:', {
        totalVulnerabilities: result.analysis_summary?.total_vulnerabilities,
        processedSuccessfully: result.analysis_summary?.processed_successfully,
        fixesCount: result.vulnerability_fixes?.length
      });

      console.log('=== End AI API Request Debug ===');
      return result;
    } catch (error) {
      console.error('AI 조치 방안 요청 실패:', error);
      if (error.message.includes('fetch')) {
        throw new Error('AI 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      throw error;
    }
  }

  // AI API 상태 확인
  async checkAIApiHealth(aiApiBaseUrl = 'https://vulnerability-resolution-ai-production.up.railway.app') {
    try {
      const response = await fetch(`${aiApiBaseUrl}/health`);
      if (!response.ok) {
        throw new Error(`AI API 상태 확인 실패: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('AI API 상태 확인 실패:', error);
      throw new Error('AI API 서버에 연결할 수 없습니다.');
    }
  }

// 취약점 데이터를 AI API 형식으로 변환
  transformToAIFormat(analysisResults, configText) {
    console.log('=== AI Format Transform Debug ===');
    console.log('analysisResults:', analysisResults);
    console.log('configText length:', configText?.length);

    // 기본 검증
    if (!analysisResults) {
      throw new Error('분석 결과가 없습니다.');
    }

    if (!configText || configText.trim().length === 0) {
      throw new Error('원본 설정 파일 내용이 없습니다.');
    }

    // 취약점 데이터 검증 및 변환
    let vulnerabilities = [];
        
    if (analysisResults.vulnerabilities && Array.isArray(analysisResults.vulnerabilities)) {
      vulnerabilities = analysisResults.vulnerabilities.map((vuln, index) => {
        console.log(`Processing vulnerability ${index}:`, vuln);
        
        // ID를 정수로 변환 (AI API 요구사항)
// 수정된 코드 (올바름)
let vulnerabilityId;
if (vuln.id) {
  vulnerabilityId = String(vuln.id);  // ✅ 문자열로 변환
} else {
  vulnerabilityId = `vuln_${index + 1}`;  // ✅ 문자열 형태로 생성
}

// ruleId는 문자열로 유지 (AI API에서 문자열 허용)
let ruleIdValue;
if (vuln.ruleId) {
  ruleIdValue = String(vuln.ruleId);
} else {
  ruleIdValue = `rule_${index + 1}`;
}

return {
  id: vulnerabilityId, // 🔥 정수로 변환 (AI API 요구사항)
  severity: this.normalizeSeverity(vuln.severity || vuln.severityKo),
  ruleId: ruleIdValue, // 문자열로 유지
  description: vuln.description || '취약점 설명이 없습니다.',
  type: vuln.type || vuln.typeKo || 'Security',
  line: parseInt(vuln.line) || 0,
  recommendation: vuln.recommendation || '권장사항이 없습니다.',
  matchedText: vuln.matchedText || '',
  framework: vuln.framework || analysisResults.metadata?.framework || 'Unknown'
};
      });
    } else {
      console.warn('No vulnerabilities found or vulnerabilities is not an array');
      // 취약점이 없어도 AI API는 호출할 수 있도록 빈 배열 사용
      vulnerabilities = [];
    }

    console.log('Processed vulnerabilities:', vulnerabilities);

    // 메타데이터 구성
    const metadata = {
      framework: analysisResults.metadata?.framework || 'Unknown',
      deviceType: analysisResults.metadata?.deviceType || 'Unknown',
      scanDate: new Date().toISOString().split('T')[0],
      totalLines: Math.max(0, parseInt(analysisResults.metadata?.totalLines) || 0), // 음수 방지
      engineVersion: analysisResults.metadata?.engineVersion || 'Unknown',
      analysisTime: Math.max(0, parseFloat(analysisResults.metadata?.analysisTime) || 0), // 음수 방지
      totalChecks: Math.max(0, parseInt(analysisResults.summary?.totalChecks) || 0), // 음수 방지
      timestamp: analysisResults.metadata?.timestamp || new Date().toISOString()
    };

    console.log('Metadata:', metadata);

   const vulnerabilityReport = {
      vulnerabilities: vulnerabilities,
      metadata: metadata,
      summary: {
        totalVulnerabilities: Math.max(0, vulnerabilities.length),
        totalChecks: Math.max(0, parseInt(analysisResults.summary?.totalChecks) || 0),
        passedChecks: Math.max(0, parseInt(analysisResults.summary?.passed) || 0),
        failedChecks: Math.max(0, vulnerabilities.length),
        skippedChecks: Math.max(0, parseInt(analysisResults.summary?.skipped) || 0)
      }
    };

    const result = {
      original_config: configText.trim(),
      vulnerability_report: vulnerabilityReport
    };

    console.log('Final AI format result:', {
  config_length: result.original_config.length,
  vulnerability_count: vulnerabilityReport.vulnerabilities.length,
  metadata: vulnerabilityReport.metadata,
  sample_vulnerability_ids: vulnerabilityReport.vulnerabilities.slice(0, 3).map(v => ({ 
    id: v.id, 
    type: typeof v.id,  // 이제 'number'가 나와야 함
    originalId: v.originalId, // 디버깅용
    ruleId: v.ruleId,
    ruleIdType: typeof v.ruleId 
  }))
});

    console.log('=== End AI Format Transform Debug ===');

    return result;
  }
    normalizeSeverity(severity) {
    if (!severity) return 'Medium';
    
    const severityMap = {
      '상': 'High',
      '중': 'Medium', 
      '하': 'Low',
      'Critical': 'High',
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low',
      '고위험': 'High',
      '중위험': 'Medium',
      '저위험': 'Low'
    };

    return severityMap[severity] || 'Medium';
  }
}

// 서비스 인스턴스 생성 및 내보내기
const analysisServiceInstance = new AnalysisService();
export default analysisServiceInstance;
