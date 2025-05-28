const API_BASE_URL = 'https://kisa-network-analyzer-production.up.railway.app/api/v1';

class AnalysisService {
  // 헬스 체크
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('서비스 연결에 실패했습니다: ' + error.message);
    }
  }

  // 지원 장비 타입 조회
  async getDeviceTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/device-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('장비 타입 조회에 실패했습니다: ' + error.message);
    }
  }

  // 룰 목록 조회
  async getRules() {
    try {
      const response = await fetch(`${API_BASE_URL}/rules`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('룰 목록 조회에 실패했습니다: ' + error.message);
    }
  }

  // 설정 파일 분석 (메인 API)
  async analyzeConfig(deviceType, configText, options = {}) {
    try {
      const requestBody = {
        deviceType,
        configText,
        options: {
          checkAllRules: true,
          returnRawMatches: false,
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

  // 파일을 텍스트로 변환
  async fileToText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('파일 읽기에 실패했습니다'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 분석 결과를 UI용 형식으로 변환
  transformAnalysisResult(apiResult) {
    if (!apiResult.success) {
      throw new Error(apiResult.error || '분석에 실패했습니다');
    }

    // 심각도 매핑
    const severityMapping = {
      '상': 'High',
      '중': 'Medium', 
      '하': 'Low'
    };

    // 카테고리 매핑
    const categoryMapping = {
      '계정 관리': 'Authentication',
      '접근 관리': 'Access Control',
      '기능 관리': 'Function Management',
      '로그 관리': 'Log Management',
      '패치 관리': 'Patch Management'
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
      reference: result.reference
    }));

    return {
      summary: {
        totalChecks: apiResult.statistics?.totalRulesChecked || 0,
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
        totalLines: apiResult.totalLines,
        analysisTime: apiResult.analysisTime,
        timestamp: apiResult.timestamp
      }
    };
  }
}

export default new AnalysisService();