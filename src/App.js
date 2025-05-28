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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('checking');

  // 컴포넌트 마운트 시 서비스 상태 및 장비 타입 조회
  useEffect(() => {
    checkServiceHealth();
    loadDeviceTypes();
  }, []);

  const checkServiceHealth = async () => {
    try {
      await analysisService.checkHealth();
      setServiceStatus('online');
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('offline');
    }
  };

  const loadDeviceTypes = async () => {
    try {
      const response = await analysisService.getDeviceTypes();
      if (response.success) {
        setDeviceTypes(response.deviceTypes);
      }
    } catch (error) {
      console.error('Failed to load device types:', error);
      // 기본값 설정
      setDeviceTypes(['Cisco', 'Juniper', 'Radware', 'Passport', 'Piolink']);
    }
  };

  const handleFileUpload = async (file, deviceType) => {
    if (!file || !deviceType) {
      setAnalysisError('파일과 장비 타입을 모두 선택해주세요.');
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);

    try {
      // 파일을 텍스트로 변환
      const configText = await analysisService.fileToText(file);
      
      if (!configText.trim()) {
        throw new Error('파일이 비어있거나 읽을 수 없습니다.');
      }

      // API 호출하여 분석
      const apiResult = await analysisService.analyzeConfig(deviceType, configText);
      
      // 결과를 UI 형식으로 변환
      const transformedResult = analysisService.transformAnalysisResult(apiResult);
      
      setAnalysisResults(transformedResult);
      setActiveTab('results');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message);
      
      // 에러 발생 시에도 결과 탭으로 이동하여 에러 메시지 표시
      setActiveTab('results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryAnalysis = () => {
    if (uploadedFile) {
      // 이전에 선택된 장비 타입을 가져오기 위해 상태로 관리해야 함
      // 현재는 다시 업로드하도록 안내
      setActiveTab('upload');
      setAnalysisError(null);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setActiveTab('upload');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        serviceStatus={serviceStatus}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header serviceStatus={serviceStatus} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              analysisResults={analysisResults}
              serviceStatus={serviceStatus}
              onNavigateToUpload={() => setActiveTab('upload')}
              onNavigateToResults={() => setActiveTab('results')}
            />
          )}
          {activeTab === 'upload' && (
            <FileUpload 
              onFileUpload={handleFileUpload}
              uploadedFile={uploadedFile}
              isAnalyzing={isAnalyzing}
              deviceTypes={deviceTypes}
              analysisError={analysisError}
              onReset={resetAnalysis}
            />
          )}
          {activeTab === 'results' && (
            <VulnerabilityResults 
              results={analysisResults}
              isAnalyzing={isAnalyzing}
              error={analysisError}
              onRetry={handleRetryAnalysis}
              onReset={resetAnalysis}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;