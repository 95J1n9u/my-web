import React, { useState, useRef, useEffect } from 'react';
import analysisService from '../services/analysisService';

const FileUpload = ({ onFileUpload, uploadedFile, isAnalyzing, analysisError, onReset }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('KISA');
  const [selectedFile, setSelectedFile] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(true);
  const [enableComparison, setEnableComparison] = useState(false);
  const [comparisonFrameworks, setComparisonFrameworks] = useState(['KISA']);
  const fileInputRef = useRef(null);

  // 컴포넌트 마운트 시 지침서 목록 로드
  useEffect(() => {
    loadFrameworks();
  }, []);

  // 선택된 지침서 변경 시 - 추후 장비 타입 목록 업데이트가 필요할 경우 사용
  useEffect(() => {
    // 현재는 정적 장비 타입 목록 사용
    // 필요시 loadDeviceTypes(selectedFramework) 호출
  }, [selectedFramework]);

  const loadFrameworks = async () => {
    try {
      setLoadingFrameworks(true);
      const response = await analysisService.getFrameworks();
      if (response.success) {
        setFrameworks(response.frameworks);
        // 기본값으로 첫 번째 구현된 지침서 선택
        const implementedFramework = response.frameworks.find(f => f.isImplemented);
        if (implementedFramework) {
          setSelectedFramework(implementedFramework.id);
        }
      }
    } catch (error) {
      console.error('지침서 목록 로드 실패:', error);
      // 기본값 설정
      setFrameworks([
        {
          id: 'KISA',
          name: 'KISA 네트워크 장비 보안 가이드',
          description: '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
          isImplemented: true,
          status: 'active'
        }
      ]);
    } finally {
      setLoadingFrameworks(false);
    }
  };

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
    if (!selectedFramework) {
      alert('보안 지침서를 선택해주세요.');
      return;
    }

    // 비교 분석 모드인 경우
    if (enableComparison && comparisonFrameworks.length > 1) {
      onFileUpload(selectedFile, selectedDeviceType, null, comparisonFrameworks);
    } else {
      onFileUpload(selectedFile, selectedDeviceType, selectedFramework);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedDeviceType('');
    setSelectedFramework('KISA');
    setEnableComparison(false);
    setComparisonFrameworks(['KISA']);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  const handleComparisonFrameworkChange = (frameworkId, checked) => {
    if (checked) {
      setComparisonFrameworks([...comparisonFrameworks, frameworkId]);
    } else {
      setComparisonFrameworks(comparisonFrameworks.filter(f => f !== frameworkId));
    }
  };

  const getFrameworkInfo = (frameworkId) => {
    return analysisService.getFrameworkInfo(frameworkId);
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
        <p className="text-gray-600">다양한 보안 지침서를 적용한 네트워크 장비 설정 파일 분석</p>
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
          {/* Framework Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. 보안 지침서 선택</h3>
            
            {loadingFrameworks ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">지침서 목록을 불러오는 중...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 단일 지침서 선택 */}
                <div className="space-y-3">
                  {frameworks.map((framework) => {
                    const info = getFrameworkInfo(framework.id);
                    return (
                      <label key={framework.id} className={`flex items-start cursor-pointer p-3 rounded-lg border transition-colors ${
                        selectedFramework === framework.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      } ${!framework.isImplemented ? 'opacity-50' : ''}`}>
                        <input
                          type="radio"
                          name="framework"
                          value={framework.id}
                          checked={selectedFramework === framework.id}
                          onChange={(e) => setSelectedFramework(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                          disabled={isAnalyzing || !framework.isImplemented}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{framework.name}</div>
                            {info && (
                              <span 
                                className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                                style={{ backgroundColor: info.color + '20', color: info.color }}
                              >
                                {info.country}
                              </span>
                            )}
                            {!framework.isImplemented && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                구현 예정
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{framework.description}</div>
                          {framework.version && (
                            <div className="text-xs text-gray-400 mt-1">버전: {framework.version}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* 비교 분석 옵션 */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={enableComparison}
                      onChange={(e) => setEnableComparison(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={isAnalyzing}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">다중 지침서 비교 분석</div>
                      <div className="text-xs text-gray-500">여러 보안 지침서의 결과를 동시에 비교</div>
                    </div>
                  </label>

                  {enableComparison && (
                    <div className="mt-3 pl-7 space-y-2">
                      {frameworks.filter(f => f.isImplemented).map((framework) => (
                        <label key={framework.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={comparisonFrameworks.includes(framework.id)}
                            onChange={(e) => handleComparisonFrameworkChange(framework.id, e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={isAnalyzing}
                          />
                          <span className="text-sm text-gray-700">{framework.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Device Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2. 장비 타입 선택</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">3. 설정 파일 업로드</h3>
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
              disabled={!selectedFile || !selectedDeviceType || !selectedFramework || isAnalyzing}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                selectedFile && selectedDeviceType && selectedFramework && !isAnalyzing
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
                  {enableComparison && comparisonFrameworks.length > 1 ? '비교 분석 시작' : '보안 분석 시작'}
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
                  <span className="text-sm text-gray-600">
                    {enableComparison ? '다중 지침서 분석...' : `${selectedFramework} 지침서 적용...`}
                  </span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">보안 룰셋 적용...</span>
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
          {/* Selected Framework Details */}
          {selectedFramework && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">선택된 보안 지침서</h3>
              {(() => {
                const framework = frameworks.find(f => f.id === selectedFramework);
                const info = getFrameworkInfo(selectedFramework);
                if (!framework) return null;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">{framework.name}</div>
                      {info && (
                        <span 
                          className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                          style={{ backgroundColor: info.color + '20', color: info.color }}
                        >
                          {info.organization}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                    {framework.total_rules && (
                      <div className="text-sm text-gray-500">
                        총 {framework.total_rules}개 보안 룰셋
                      </div>
                    )}
                    {info && info.categories && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {info.categories.slice(0, 3).map((category, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {category}
                          </span>
                        ))}
                        {info.categories.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{info.categories.length - 3}개
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">다중 지침서 분석 기능</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">다양한 보안 지침서 지원</p>
                  <p className="text-xs text-gray-500">KISA, CIS, NIST 등 국내외 주요 보안 표준</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">지침서 간 비교 분석</p>
                  <p className="text-xs text-gray-500">여러 지침서의 결과를 동시에 비교</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">논리 기반 분석 엔진</p>
                  <p className="text-xs text-gray-500">단순 패턴 매칭을 넘어선 지능형 분석</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">상세한 권고사항</p>
                  <p className="text-xs text-gray-500">각 지침서별 구체적인 해결 방법 제공</p>
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