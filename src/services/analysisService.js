const API_BASE_URL = 'https://kisa-network-analyzer-production.up.railway.app/api/v1';

class AnalysisService {
  // 헬스 체크 (다중 지침서 정보 포함)
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('서비스 연결에 실패했습니다: ' + error.message);
    }
  }

  // 지원되는 보안 지침서 목록 조회 (NEW)
  async getFrameworks() {
    try {
      const response = await fetch(`${API_BASE_URL}/frameworks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('지침서 목록 조회에 실패했습니다: ' + error.message);
    }
  }

  // 특정 지침서의 룰 목록 조회 (NEW)
  async getFrameworkRules(frameworkId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.includeExamples) queryParams.append('includeExamples', options.includeExamples);
      if (options.deviceType) queryParams.append('deviceType', options.deviceType);
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

  // 지원 장비 타입 조회 (업데이트: framework 파라미터 추가)
  async getDeviceTypes(framework = 'KISA') {
    try {
      const response = await fetch(`${API_BASE_URL}/device-types?framework=${framework}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('장비 타입 조회에 실패했습니다: ' + error.message);
    }
  }

  // 룰 목록 조회 (업데이트: framework 파라미터 추가)
  async getRules(framework = 'KISA', options = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('framework', framework);
      if (options.includeExamples) queryParams.append('includeExamples', options.includeExamples);
      if (options.deviceType) queryParams.append('deviceType', options.deviceType);
      if (options.severity) queryParams.append('severity', options.severity);

      const response = await fetch(`${API_BASE_URL}/rules?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('룰 목록 조회에 실패했습니다: ' + error.message);
    }
  }

  // 특정 룰 상세 정보 조회 (NEW)
  async getRuleDetail(ruleId, framework = 'KISA', includeExamples = true) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('framework', framework);
      queryParams.append('includeExamples', includeExamples);

      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('룰 상세 정보 조회에 실패했습니다: ' + error.message);
    }
  }

  // 설정 파일 분석 (업데이트: framework 파라미터 추가)
  async analyzeConfig(deviceType, configText, framework = 'KISA', options = {}) {
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
          ...options
        }
      };

      const response = await fetch(`${API_BASE_URL}/config-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
          throw new Error(errorData?.error || `${framework} 지침서는 아직 구현되지 않았습니다.`);
        } else {
          throw new Error(errorData?.error || `서버 오류: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
      }
      throw error;
    }
  }

  // 다중 지침서 비교 분석 (NEW - 향후 구현)
  async compareAnalysis(deviceType, configText, frameworks = ['KISA', 'CIS'], options = {}) {
    try {
      // 현재는 순차적으로 각 지침서 분석 후 결과 병합
      const results = {};
      for (const framework of frameworks) {
        try {
          results[framework] = await this.analyzeConfig(deviceType, configText, framework, options);
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
        uniqueByFramework: {}
      },
      metadata: {
        timestamp: new Date().toISOString(),
        comparedFrameworks: frameworks
      }
    };

    // 성공한 분석 결과 처리
    const successfulResults = {};
    for (const [framework, result] of Object.entries(results)) {
      if (result.success) {
        comparison.summary.successfulAnalyses++;
        comparison.summary.totalIssues += result.issuesFound || 0;
        comparison.summary.uniqueByFramework[framework] = result.issuesFound || 0;
        successfulResults[framework] = result;
      }
    }

    return comparison;
  }

  // 설정 파일 문법 검증 (NEW)
  async validateConfig(deviceType, configText) {
    try {
      const response = await fetch(`${API_BASE_URL}/config-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceType,
          configText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error('설정 파일 검증에 실패했습니다: ' + error.message);
    }
  }

  // 통계 정보 조회 (NEW)
  async getStatistics(framework = 'KISA') {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics?framework=${framework}`);
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
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('파일 읽기에 실패했습니다'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 분석 결과를 UI용 형식으로 변환 (업데이트: 다중 지침서 정보 포함)
  transformAnalysisResult(apiResult) {
    if (!apiResult.success) {
      throw new Error(apiResult.error || '분석에 실패했습니다');
    }

    // 심각도 매핑 (다중 지침서 지원)
    const severityMapping = {
      // KISA
      '상': 'High',
      '중': 'Medium', 
      '하': 'Low',
      // CIS
      'Critical': 'Critical',
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low',
      // NIST
      'Moderate': 'Medium'
      // NIST의 High, Low는 위의 CIS와 동일하므로 중복 제거
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
      // NIST
      'Identify': 'Identification',
      'Protect': 'Protection',
      'Detect': 'Detection',
      'Respond': 'Response',
      'Recover': 'Recovery'
    };

    const transformedVulnerabilities = apiResult.results.map((result, index) => ({
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
      analysisType: result.analysisType || 'logical'
    }));

    return {
      summary: {
        totalChecks: apiResult.statistics?.totalRulesChecked || apiResult.analysisDetails?.rulesApplied || 0,
        vulnerabilities: apiResult.issuesFound || 0,
        warnings: apiResult.statistics?.mediumSeverityIssues || 0,
        passed: apiResult.statistics?.rulesPassed || 0,
        highSeverity: apiResult.statistics?.highSeverityIssues || 0,
        mediumSeverity: apiResult.statistics?.mediumSeverityIssues || 0,
        lowSeverity: apiResult.statistics?.lowSeverityIssues || 0
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
        analysisDetails: apiResult.analysisDetails
      }
    };
  }

  // 지침서별 특성 정보 반환 (NEW)
  getFrameworkInfo(frameworkId) {
    const frameworkDetails = {
      'KISA': {
        name: 'KISA 네트워크 장비 보안 가이드',
        description: '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
        country: 'KR',
        organization: '한국인터넷진흥원',
        severityLevels: ['상', '중', '하'],
        categories: ['계정 관리', '접근 관리', '패치 관리', '로그 관리', '기능 관리'],
        color: '#0066CC',
        isImplemented: true
      },
      'CIS': {
        name: 'CIS Controls',
        description: 'Center for Internet Security Controls',
        country: 'US',
        organization: 'Center for Internet Security',
        severityLevels: ['Critical', 'High', 'Medium', 'Low'],
        categories: ['Inventory and Control', 'Configuration Management', 'Access Control', 'Secure Configuration'],
        color: '#FF6B35',
        isImplemented: false
      },
      'NIST': {
        name: 'NIST Cybersecurity Framework',
        description: 'National Institute of Standards and Technology Cybersecurity Framework',
        country: 'US',
        organization: 'NIST',
        severityLevels: ['High', 'Moderate', 'Low'],
        categories: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
        color: '#28A745',
        isImplemented: false
      }
    };

    return frameworkDetails[frameworkId] || null;
  }
}

// 서비스 인스턴스 생성 및 내보내기
const analysisServiceInstance = new AnalysisService();
export default analysisServiceInstance;