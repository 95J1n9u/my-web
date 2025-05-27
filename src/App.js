import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import VulnerabilityResults from './components/VulnerabilityResults';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    // 실제 분석 로직은 여기에 구현
    // 현재는 더미 데이터로 시뮬레이션
    setTimeout(() => {
      setAnalysisResults({
        summary: {
          totalChecks: 25,
          vulnerabilities: 8,
          warnings: 12,
          passed: 5
        },
        vulnerabilities: [
          {
            id: 1,
            severity: 'High',
            type: 'Authentication',
            description: 'Weak password policy detected',
            recommendation: 'Implement strong password requirements'
          },
          {
            id: 2,
            severity: 'Medium',
            type: 'Access Control',
            description: 'Unnecessary open ports found',
            recommendation: 'Close unused ports and services'
          },
          {
            id: 3,
            severity: 'High',
            type: 'Encryption',
            description: 'Weak encryption protocol in use',
            recommendation: 'Upgrade to latest encryption standards'
          }
        ]
      });
      setActiveTab('results');
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'upload' && (
            <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />
          )}
          {activeTab === 'results' && (
            <VulnerabilityResults results={analysisResults} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;