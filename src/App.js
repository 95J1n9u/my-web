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
          isImplemented: true, // NW를 구현됨으로 변경
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
    loadDeviceTypes(frameworkId); // 선택된 지침서에 따라 장비 타입 목록 업데이트
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serviceStatus={serviceStatus}
        engineInfo={{
          ...engineInfo,
          frameworkStats,
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          serviceStatus={serviceStatus}
          selectedFramework={selectedFramework}
          frameworks={frameworks}
          onFrameworkChange={handleFrameworkChange}
          engineInfo={engineInfo}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 pb-safe">
          <div className="page-container">
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
                onNavigateToUpload={() => setActiveTab('upload')}
                onNavigateToResults={() => setActiveTab('results')}
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

      {/* Global Status Indicators */}
      {serviceStatus === 'checking' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              서비스 연결 확인 중...
            </span>
          </div>
        </div>
      )}

      {serviceStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-50 rounded-lg shadow-lg p-4 border border-red-200 z-50">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-500"
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
            <span className="text-sm text-red-800">서비스 연결 실패</span>
          </div>
        </div>
      )}

      {/* New Framework Notification */}
      {frameworks.some(f => f.id === 'NW' && f.isImplemented) && (
        <div className="fixed bottom-4 left-4 bg-green-50 rounded-lg shadow-lg p-4 border border-green-200 max-w-sm z-50">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="text-sm font-medium text-green-800">
                NW 지침서 추가됨
              </div>
              <div className="text-xs text-green-600 mt-1">
                42개의 새로운 보안 룰이 추가되어 더욱 강화된 분석이 가능합니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Progress Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                분석 진행 중
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {comparisonResults
                  ? '다중 지침서로 분석 중입니다'
                  : `${selectedFramework} 지침서로 분석 중입니다`}
              </p>
              <div className="text-xs text-gray-500">
                {selectedFramework === 'KISA' && '38개 룰 검사 중...'}
                {selectedFramework === 'CIS' && '11개 룰 검사 중...'}
                {selectedFramework === 'NW' && '42개 룰 검사 중...'}
                {comparisonResults &&
                  `${frameworks.filter(f => f.isImplemented).length}개 지침서 비교 분석 중...`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
