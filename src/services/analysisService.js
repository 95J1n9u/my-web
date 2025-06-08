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
    options = {}
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
          ...options,
        },
      };

      const response = await fetch(`${API_BASE_URL}/config-analyze`, {
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

    // 심각도 매핑 (다중 지침서 지원)
    const severityMapping = {
      // KISA
      상: 'High',
      중: 'Medium',
      하: 'Low',
      // CIS & NW
      Critical: 'Critical',
      High: 'High',
      Medium: 'Medium',
      Low: 'Low',
      // NIST
      Moderate: 'Medium',
    };

    // 카테고리 매핑 (다중 지침서 지원)
    const categoryMapping = {
      // KISA
      '계정 관리': 'Authentication',
      '접근 관리': 'Access Control',
      '기능 관리': 'Function Management',
      '로그 관리': 'Log Management',
      '패치 관리': 'Patch Management',
      // CIS
      'Inventory and Control': 'Asset Management',
      'Configuration Management': 'Configuration',
      'Access Control': 'Access Control',
      'Secure Configuration': 'Configuration',
      // NW
      비밀번호: 'Authentication',
      '네트워크 접근': 'Access Control',
      '서비스 관리': 'Function Management',
      // NIST
      Identify: 'Identification',
      Protect: 'Protection',
      Detect: 'Detection',
      Respond: 'Response',
      Recover: 'Recovery',
    };

    const transformedVulnerabilities = apiResult.results.map(
      (result, index) => ({
        id: index + 1,
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
      })
    );

    return {
      summary: {
        totalChecks:
          apiResult.statistics?.totalRulesChecked ||
          apiResult.analysisDetails?.rulesApplied ||
          0,
        vulnerabilities: apiResult.issuesFound || 0,
        warnings: apiResult.statistics?.mediumSeverityIssues || 0,
        passed: apiResult.statistics?.rulesPassed || 0,
        highSeverity: apiResult.statistics?.highSeverityIssues || 0,
        mediumSeverity: apiResult.statistics?.mediumSeverityIssues || 0,
        lowSeverity: apiResult.statistics?.lowSeverityIssues || 0,
      },
      vulnerabilities: transformedVulnerabilities,
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
      },
    };
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
      console.log('AI 조치 방안 요청 시작:', {
        configLength: configText.length,
        vulnerabilityCount: vulnerabilityReport.vulnerabilities?.length
      });

      const requestBody = {
        original_config: configText,
        vulnerability_report: vulnerabilityReport
      };

      const response = await fetch(`${aiApiBaseUrl}/analyze-vulnerabilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 400) {
          throw new Error(errorData?.detail || '잘못된 요청 데이터입니다');
        } else if (response.status === 422) {
          throw new Error('데이터 검증에 실패했습니다. 입력 형식을 확인해주세요.');
        } else if (response.status === 500) {
          throw new Error('AI 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(errorData?.detail || `AI API 오류: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('AI 조치 방안 응답 받음:', {
        totalVulnerabilities: result.analysis_summary?.total_vulnerabilities,
        processedSuccessfully: result.analysis_summary?.processed_successfully,
        fixesCount: result.vulnerability_fixes?.length
      });

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
    const vulnerabilityReport = {
      vulnerabilities: analysisResults.vulnerabilities.map((vuln, index) => ({
        id: vuln.id || index + 1,
        severity: vuln.severity || vuln.severityKo,
        ruleId: vuln.ruleId,
        description: vuln.description,
        type: vuln.type || vuln.typeKo,
        line: vuln.line,
        recommendation: vuln.recommendation
      })),
      metadata: {
        framework: analysisResults.metadata?.framework || 'Unknown',
        deviceType: analysisResults.metadata?.deviceType || 'Unknown',
        scanDate: new Date().toISOString().split('T')[0],
        totalLines: analysisResults.metadata?.totalLines,
        engineVersion: analysisResults.metadata?.engineVersion
      }
    };

    return {
      original_config: configText,
      vulnerability_report: vulnerabilityReport
    };
  }
}

// 서비스 인스턴스 생성 및 내보내기
const analysisServiceInstance = new AnalysisService();
export default analysisServiceInstance;
