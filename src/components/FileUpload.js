import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileUpload, uploadedFile, isAnalyzing, deviceTypes, analysisError, onReset }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // 파일 크기 체크 (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('파일 크기가 너무 큽니다. 최대 50MB까지 업로드할 수 있습니다.');
      return;
    }

    // 파일 확장자 체크
    const allowedExtensions = ['.txt', '.cfg', '.conf', '.xml', '.log'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      alert('지원되지 않는 파일 형식입니다. .txt, .cfg, .conf, .xml, .log 파일을 업로드해주세요.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      alert('분석할 파일을 선택해주세요.');
      return;
    }
    if (!selectedDeviceType) {
      alert('장비 타입을 선택해주세요.');
      return;
    }
    onFileUpload(selectedFile, selectedDeviceType);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedDeviceType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  const deviceTypeOptions = [
    { value: 'Cisco', label: 'Cisco IOS/IOS-XE', description: 'Cisco 라우터, 스위치' },
    { value: 'Juniper', label: 'Juniper JunOS', description: 'Juniper 네트워크 장비' },
    { value: 'Radware', label: 'Radware Alteon', description: 'Radware 로드밸런서' },
    { value: 'Passport', label: 'Nortel Passport', description: 'Nortel/Avaya 장비' },
    { value: 'Piolink', label: 'Piolink', description: 'Piolink 로드밸런서' }
  ];

  const supportedFormats = [
    { name: 'Cisco IOS', extension: '.txt, .cfg, .conf' },
    { name: 'Juniper JunOS', extension: '.conf, .txt, .xml' },
    { name: 'Radware Alteon', extension: '.cfg, .txt' },
    { name: 'Nortel Passport', extension: '.cfg, .txt' },
    { name: 'Piolink', extension: '.cfg, .txt' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">파일 업로드 & 분석</h1>
        <p className="text-gray-600">보안 분석을 위한 네트워크 장비 설정 파일을 업로드하세요</p>
      </div>

      {/* Error Message */}
      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">분석 오류</p>
              <p className="text-sm text-red-700">{analysisError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload and Configuration Area */}
        <div className="space-y-6">
          {/* Device Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 장비 타입 선택</h3>
            <div className="space-y-3">
              {deviceTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="deviceType"
                    value={option.value}
                    checked={selectedDeviceType === option.value}
                    onChange={(e) => setSelectedDeviceType(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isAnalyzing}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 설정 파일 업로드</h3>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : selectedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".txt,.cfg,.conf,.xml,.log"
                className="hidden"
                disabled={isAnalyzing}
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium text-green-600">파일 선택 완료</p>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">크기: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  {!isAnalyzing && (
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      다른 파일 선택
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    설정 파일을 여기에 드래그하거나 
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="text-blue-600 hover:text-blue-500 ml-1"
                      disabled={isAnalyzing}
                    >
                      찾아보기
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">최대 50MB까지 .txt, .cfg, .conf, .xml, .log 파일 지원</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAnalyzeClick}
              disabled={!selectedFile || !selectedDeviceType || isAnalyzing}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedFile && selectedDeviceType && !isAnalyzing
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  보안 분석 시작
                </>
              )}
            </button>
            
            {(selectedFile || analysisError) && (
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                초기화
              </button>
            )}
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 진행 상황</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">설정 파일 업로드...</span>
                  <span className="text-sm font-medium text-green-600">✓ 완료</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">파일 내용 분석...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">KISA 보안 룰셋 적용...</span>
                  <span className="text-sm text-gray-400">대기중</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">취약점 탐지 및 분석...</span>
                  <span className="text-sm text-gray-400">대기중</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">보고서 생성...</span>
                  <span className="text-sm text-gray-400">대기중</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Supported Formats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지원 파일 형식</h3>
            <div className="space-y-3">
              {supportedFormats.map((format, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-900">{format.name}</span>
                  <span className="text-sm text-gray-500">{format.extension}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Features */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KISA 보안 분석 기능</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">38개 KISA 보안 룰셋</p>
                  <p className="text-xs text-gray-500">한국인터넷진흥원 공식 보안 가이드 기반</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">실시간 취약점 탐지</p>
                  <p className="text-xs text-gray-500">패스워드, 접근제어, 로그 관리 등</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">상세한 권고사항</p>
                  <p className="text-xs text-gray-500">각 취약점별 구체적인 해결 방법</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">다중 벤더 지원</p>
                  <p className="text-xs text-gray-500">Cisco, Juniper, Radware 등 주요 제조사</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">보안 정책</p>
                <p className="text-xs text-blue-700">
                  업로드된 모든 파일은 분석 후 즉시 삭제되며 서버에 저장되지 않습니다. 
                  모든 통신은 HTTPS로 암호화되어 전송됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;