import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import VulnerabilityResults from './components/VulnerabilityResults';
import analysisService from './services/analysisService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('KISA');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [engineInfo, setEngineInfo] = useState(null);

  // 모바일 사이드바 상태 추가
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 알림 상태 관리 추가
  const [dismissedNotifications, setDismissedNotifications] = useState(
    new Set()
  );

  // 알림 닫기 함수
  const dismissNotification = notificationId => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  // 모바일 사이드바 토글
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // 탭 변경시 모바일 사이드바 닫기
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  // 컴포넌트 마운트 시 서비스 상태 및 기본 정보 로드
  useEffect(() => {
    const initialize = async () => {
      await checkServiceHealth();
      await loadFrameworks();
      await loadDeviceTypes();
    };
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkServiceHealth = async () => {
    try {
      const response = await analysisService.checkHealth();
      setServiceStatus('online');
      setEngineInfo({
        version: response.version,
        engineVersion: response.engineVersion,
        supportedFrameworks: response.supportedFrameworks,
        implementedFrameworks: response.implementedFrameworks,
        features: response.features,
        frameworkDetails: response.frameworkDetails,
      });
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('offline');
    }
  };

  const loadFrameworks = async () => {
    try {
      const response = await analysisService.getFrameworks();
      if (response.success) {
        setFrameworks(response.frameworks);
        // 기본값으로 첫 번째 구현된 지침서 선택
        const implementedFramework = response.frameworks.find(
          f => f.isImplemented
        );
        if (implementedFramework) {
          setSelectedFramework(implementedFramework.id);
        }
      }
    } catch (error) {
      console.error('Failed to load frameworks:', error);
      // API에서 로드 실패 시 기본값 설정 (NW를 구현됨으로 표시)
      setFrameworks([
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
          isImplemented: true,
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
      ]);
    }
  };

  const loadDeviceTypes = async (framework = 'KISA') => {
    try {
      const response = await analysisService.getDeviceTypes(framework);
      if (response.success) {
        setDeviceTypes(response.deviceTypes);
      }
    } catch (error) {
      console.error('Failed to load device types:', error);
      // 기본값 설정 - 새로운 API 명세서에 따른 확장된 장비 타입
      setDeviceTypes([
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
      ]);
    }
  };

  const handleFileUpload = async (
    file,
    deviceType,
    framework,
    comparisonFrameworks
  ) => {
    if (!file || !deviceType) {
      setAnalysisError('파일과 장비 타입을 모두 선택해주세요.');
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    setComparisonResults(null);

    try {
      // 파일을 텍스트로 변환
      const configText = await analysisService.fileToText(file);

      if (!configText.trim()) {
        throw new Error('파일이 비어있거나 읽을 수 없습니다.');
      }

      // 비교 분석 모드인 경우
      if (comparisonFrameworks && comparisonFrameworks.length > 1) {
        console.log(
          'Starting comparison analysis with frameworks:',
          comparisonFrameworks
        );

        const comparisonResult = await analysisService.compareAnalysis(
          deviceType,
          configText,
          comparisonFrameworks
        );

        // 비교 결과를 UI 형식으로 변환
        const transformedResults = {};
        for (const [frameworkId, result] of Object.entries(
          comparisonResult.frameworks
        )) {
          if (result.success) {
            transformedResults[frameworkId] =
              analysisService.transformAnalysisResult(result);
          } else {
            transformedResults[frameworkId] = { error: result.error };
          }
        }

        setComparisonResults({
          ...comparisonResult,
          frameworks: transformedResults,
        });
      } else {
        // 단일 지침서 분석
        const selectedFrameworkId = framework || selectedFramework;
        console.log(
          'Starting single framework analysis with:',
          selectedFrameworkId
        );

        const apiResult = await analysisService.analyzeConfig(
          deviceType,
          configText,
          selectedFrameworkId
        );
        const transformedResult =
          analysisService.transformAnalysisResult(apiResult);
        setAnalysisResults(transformedResult);
      }

      setActiveTab('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message);
      setActiveTab('results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryAnalysis = () => {
    if (uploadedFile) {
      setActiveTab('upload');
      setAnalysisError(null);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setComparisonResults(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setActiveTab('upload');
  };

  const handleFrameworkChange = frameworkId => {
    setSelectedFramework(frameworkId);
    loadDeviceTypes(frameworkId);
  };

  // 현재 표시할 결과 결정 (단일 분석 또는 비교 분석)
  const getCurrentResults = () => {
    if (comparisonResults) {
      // 비교 분석 결과에서 첫 번째 성공한 결과를 기본으로 표시
      const firstSuccessfulResult = Object.values(
        comparisonResults.frameworks
      ).find(result => !result.error);
      return firstSuccessfulResult || null;
    }
    return analysisResults;
  };

  // 지침서별 통계 정보 계산
  const getFrameworkStats = () => {
    const implementedFrameworks = frameworks.filter(f => f.isImplemented);
    return {
      total: frameworks.length,
      implemented: implementedFrameworks.length,
      totalRules: implementedFrameworks.reduce(
        (sum, f) => sum + (f.total_rules || 0),
        0
      ),
      byFramework: implementedFrameworks.reduce((acc, f) => {
        acc[f.id] = f.total_rules || 0;
        return acc;
      }, {}),
    };
  };

  const frameworkStats = getFrameworkStats();

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* 모바일 오버레이 */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed lg:relative lg:translate-x-0 transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          serviceStatus={serviceStatus}
          engineInfo={{
            ...engineInfo,
            frameworkStats,
          }}
        />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Header
          serviceStatus={serviceStatus}
          selectedFramework={selectedFramework}
          frameworks={frameworks}
          onFrameworkChange={handleFrameworkChange}
          engineInfo={engineInfo}
          onToggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                analysisResults={getCurrentResults()}
                comparisonResults={comparisonResults}
                serviceStatus={serviceStatus}
                selectedFramework={selectedFramework}
                frameworks={frameworks}
                engineInfo={{
                  ...engineInfo,
                  frameworkStats,
                }}
                onNavigateToUpload={() => handleTabChange('upload')}
                onNavigateToResults={() => handleTabChange('results')}
              />
            )}
            {activeTab === 'upload' && (
              <FileUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isAnalyzing={isAnalyzing}
                frameworks={frameworks}
                deviceTypes={deviceTypes}
                selectedFramework={selectedFramework}
                analysisError={analysisError}
                onReset={resetAnalysis}
              />
            )}
            {activeTab === 'results' && (
              <VulnerabilityResults
                results={getCurrentResults()}
                comparisonResults={comparisonResults}
                isAnalyzing={isAnalyzing}
                error={analysisError}
                selectedFramework={selectedFramework}
                frameworks={frameworks}
                onRetry={handleRetryAnalysis}
                onReset={resetAnalysis}
              />
            )}
          </div>
        </main>
      </div>

      {/* 상태 표시 - 모바일 최적화 */}
      {serviceStatus === 'checking' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-50 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">연결 확인 중...</span>
          </div>
        </div>
      )}

      {serviceStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-50 rounded-lg shadow-lg p-3 border border-red-200 z-50 max-w-xs">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm text-red-800">연결 실패</span>
          </div>
        </div>
      )}

      {/* 분석 진행 오버레이 */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                분석 진행 중
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {comparisonResults
                  ? '다중 지침서 분석 중'
                  : `${selectedFramework} 지침서 분석 중`}
              </p>
              <div className="text-xs text-gray-500">
                잠시만 기다려주세요...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
