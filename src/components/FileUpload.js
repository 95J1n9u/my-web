import React, { useState, useRef, useEffect } from 'react';
import analysisService from '../services/analysisService';
import { validateFileContent } from '../utils/validation';
import SecurityLogger from '../utils/security-logger';

// 🔥 기본 분석 옵션을 컴포넌트 외부 상수로 선언
const DEFAULT_ANALYSIS_OPTIONS = {
  includePassedRules: true,      // 통과항목 기본 포함
  includeSkippedRules: true,     // 스킵항목 기본 포함
  useConsolidation: true,        // 결과 통합
  showDetailedInfo: true,        // 상세정보
  enableComplianceMode: false    // 컴플라이언스 모드는 false로 유지
};

const FileUpload = ({
  onFileUpload,
  uploadedFile,
  isAnalyzing,
  analysisError,
  onReset,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState([]); // 다중 선택으로 변경
  const [selectedFile, setSelectedFile] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(true);
  const fileInputRef = useRef(null);
  const [showAllDeviceTypes, setShowAllDeviceTypes] = useState(false);

  // 컴포넌트 마운트 시 지침서 목록 로드
  useEffect(() => {
    loadFrameworks();
    loadDeviceTypes();
  }, []);

  const loadFrameworks = async () => {
    try {
      setLoadingFrameworks(true);
      const response = await analysisService.getFrameworks();
      if (response.success) {
        // NW가 구현됨으로 표시되도록 강제 수정
        const updatedFrameworks = response.frameworks.map(framework => {
          if (framework.id === 'NW') {
            return {
              ...framework,
              isImplemented: true,
              status: 'active',
            };
          }
          return framework;
        });

        setFrameworks(updatedFrameworks);
      }
    } catch (error) {
      console.error('지침서 목록 로드 실패:', error);
      // 기본값 설정 - NW를 구현됨으로 포함
      setFrameworks([
        {
          id: 'KISA',
          name: 'KISA 네트워크 장비 보안 가이드',
          description:
            '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
          isImplemented: true,
          status: 'active',
          total_rules: 38,
        },
        {
          id: 'CIS',
          name: 'CIS Controls',
          description: 'Center for Internet Security Controls',
          isImplemented: true,
          status: 'active',
          total_rules: 11,
        },
        {
          id: 'NW',
          name: 'NW 네트워크 보안 지침서',
          description: '네트워크 보안 강화 지침서',
          isImplemented: true,
          status: 'active',
          total_rules: 42,
        },
        {
          id: 'NIST',
          name: 'NIST Cybersecurity Framework',
          description:
            'National Institute of Standards and Technology Cybersecurity Framework',
          isImplemented: false,
          status: 'planned',
          total_rules: 0,
        },
      ]);
    } finally {
      setLoadingFrameworks(false);
    }
  };

  const loadDeviceTypes = async () => {
    try {
      const response = await analysisService.getDeviceTypes();
      if (response.success) {
        setDeviceTypes(response.deviceTypes);
      }
    } catch (error) {
      console.error('장비 타입 로드 실패:', error);
      // 기본값 설정 - 새로운 API 명세서에 따른 전체 장비 타입
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

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    try {
      // 파일 크기 체크 (50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        SecurityLogger.logFileUpload(file.name, file.size, 'size_exceeded');
        alert('파일 크기가 너무 큽니다. 최대 50MB까지 업로드할 수 있습니다.');
        return;
      }

      // MIME 타입 검증 추가
      const allowedMimeTypes = ['text/plain', 'application/octet-stream', 'text/xml', ''];
      if (file.type && !allowedMimeTypes.includes(file.type)) {
        SecurityLogger.logFileUpload(file.name, file.size, 'invalid_mime_type');
        alert('지원되지 않는 파일 형식입니다.');
        return;
      }

      // 파일 확장자 체크
      const allowedExtensions = ['.txt', '.cfg', '.conf', '.xml', '.log'];
      const fileName = file.name.toLowerCase();
      const isValidExtension = allowedExtensions.some(ext =>
        fileName.endsWith(ext)
      );

      if (!isValidExtension) {
        SecurityLogger.logFileUpload(file.name, file.size, 'invalid_extension');
        alert(
          '지원되지 않는 파일 형식입니다. .txt, .cfg, .conf, .xml, .log 파일을 업로드해주세요.'
        );
        return;
      }

      // 파일 내용 검증 추가
      const fileContent = await file.text();
      
      // validation.js의 validateFileContent 함수 사용
      validateFileContent(fileContent);
      
      // 모든 검증 통과시 로그 및 파일 설정
      SecurityLogger.logFileUpload(file.name, file.size, 'success');
      setSelectedFile(file);
      
    } catch (error) {
      // 검증 실패시 로그 및 알림
      SecurityLogger.logFileUpload(file.name, file.size, `validation_failed: ${error.message}`);
      alert(`파일 검증 실패: ${error.message}`);
      console.error('File validation error:', error);
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files.length > 0) {
      await handleFileSelect(e.target.files[0]);
    }
  };

  // 장비 타입 변경 시 지원되는 지침서만 유지
  const handleDeviceTypeChange = deviceType => {
    setSelectedDeviceType(deviceType);

    // 선택된 장비 타입에 지원되지 않는 지침서들을 제거
    const compatibleFrameworks = getCompatibleFrameworks(deviceType);
    const compatibleFrameworkIds = compatibleFrameworks.map(f => f.id);
    const filteredFrameworks = selectedFrameworks.filter(frameworkId =>
      compatibleFrameworkIds.includes(frameworkId)
    );
    setSelectedFrameworks(filteredFrameworks);
  };

  // 지침서 선택/해제 처리
  const handleFrameworkToggle = (frameworkId, isSelected) => {
    if (isSelected) {
      setSelectedFrameworks([...selectedFrameworks, frameworkId]);
    } else {
      setSelectedFrameworks(
        selectedFrameworks.filter(id => id !== frameworkId)
      );
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
    if (selectedFrameworks.length === 0) {
      alert('최소 1개 이상의 보안 지침서를 선택해주세요.');
      return;
    }

    // 다중 지침서 분석 또는 단일 지침서 분석
    if (selectedFrameworks.length > 1) {
      onFileUpload(selectedFile, selectedDeviceType, null, selectedFrameworks, DEFAULT_ANALYSIS_OPTIONS);
    } else {
      onFileUpload(selectedFile, selectedDeviceType, selectedFrameworks[0], null, DEFAULT_ANALYSIS_OPTIONS);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedDeviceType('');
    setSelectedFrameworks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  const getFrameworkInfo = frameworkId =>
    analysisService.getFrameworkInfo(frameworkId);

  const deviceTypeOptions = [
    {
      value: 'Cisco',
      label: 'Cisco IOS/IOS-XE',
      description: 'Cisco 라우터, 스위치 (최대 91룰)',
      frameworks: ['KISA', 'CIS', 'NW'],
      isPrimary: true,
    },
    {
      value: 'Juniper',
      label: 'Juniper JunOS',
      description: 'Juniper 네트워크 장비 (최대 60룰)',
      frameworks: ['KISA', 'NW'],
      isPrimary: true,
    },
    {
      value: 'HP',
      label: 'HP Networking',
      description: 'HP 네트워크 장비 (최대 30룰)',
      frameworks: ['NW'],
      isPrimary: true,
    },
    {
      value: 'Piolink',
      label: 'Piolink',
      description: 'Piolink 로드밸런서 (최대 65룰)',
      frameworks: ['KISA', 'NW'],
      isPrimary: false,
    },
    {
      value: 'Radware',
      label: 'Radware Alteon',
      description: 'Radware 로드밸런서 (최대 45룰)',
      frameworks: ['KISA', 'NW'],
      isPrimary: false,
    },
    {
      value: 'Passport',
      label: 'Nortel Passport',
      description: 'Nortel/Avaya 장비 (최대 40룰)',
      frameworks: ['KISA', 'NW'],
      isPrimary: false,
    },
    {
      value: 'Alteon',
      label: 'Alteon',
      description: 'Alteon 로드밸런서 (최대 38룰)',
      frameworks: ['KISA', 'NW'],
      isPrimary: false,
    },
    {
      value: 'Dasan',
      label: 'Dasan',
      description: 'Dasan 네트워크 장비 (최대 25룰)',
      frameworks: ['NW'],
      isPrimary: false,
    },
    {
      value: 'Alcatel',
      label: 'Alcatel',
      description: 'Alcatel 네트워크 장비 (최대 28룰)',
      frameworks: ['NW'],
      isPrimary: false,
    },
    {
      value: 'Extreme',
      label: 'Extreme Networks',
      description: 'Extreme 네트워크 장비 (최대 25룰)',
      frameworks: ['NW'],
      isPrimary: false,
    },
  ];

  // 선택된 장비 타입에 따른 지원 지침서 필터링
  const getCompatibleFrameworks = (deviceType = selectedDeviceType) => {
    if (!deviceType) return frameworks.filter(f => f.isImplemented);

    const deviceOption = deviceTypeOptions.find(
      opt => opt.value === deviceType
    );
    if (!deviceOption) return frameworks.filter(f => f.isImplemented);

    return frameworks.filter(
      framework =>
        deviceOption.frameworks.includes(framework.id) &&
        framework.isImplemented
    );
  };

  const compatibleFrameworks = getCompatibleFrameworks();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title - 간소화 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">파일 분석</h1>
        <p className="text-gray-600">
          네트워크 장비 설정 파일의 보안 취약점을 분석합니다
        </p>
      </div>

      {/* Error Message */}
      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
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
            <div>
              <p className="text-sm font-medium text-red-900">분석 오류</p>
              <p className="text-sm text-red-700">{analysisError}</p>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Device Type Selection - 단순화 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              1. 장비 타입 선택
            </h3>
            {/* 주요 장비 그리드 형태로 단순화 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {deviceTypeOptions
                .filter(option => option.isPrimary)
                .map(option => (
                  <label
                    key={option.value}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-colors text-center ${
                      selectedDeviceType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deviceType"
                      value={option.value}
                      checked={selectedDeviceType === option.value}
                      onChange={e => handleDeviceTypeChange(e.target.value)}
                      className="sr-only"
                      disabled={isAnalyzing}
                    />
                    <div className="text-sm font-medium mb-1">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.frameworks.join(', ')}
                    </div>
                  </label>
                ))}
            </div>
            
            {/* 더보기 버튼 단순화 */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAllDeviceTypes(!showAllDeviceTypes)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
                disabled={isAnalyzing}
              >
                {showAllDeviceTypes ? '기본 장비만 보기' : '더 많은 장비 보기'}
              </button>
            </div>
            
            {/* 추가 장비 리스트 */}
            {showAllDeviceTypes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {deviceTypeOptions
                    .filter(option => !option.isPrimary)
                    .map(option => (
                      <label
                        key={option.value}
                        className={`cursor-pointer p-2 rounded border text-center text-xs ${
                          selectedDeviceType === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deviceType"
                          value={option.value}
                          checked={selectedDeviceType === option.value}
                          onChange={e => handleDeviceTypeChange(e.target.value)}
                          className="sr-only"
                          disabled={isAnalyzing}
                        />
                        <div className="font-medium">{option.label}</div>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Framework Selection - 단순화 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              2. 보안 지침서 선택
              {selectedDeviceType && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedDeviceType} 지원)
                </span>
              )}
            </h3>

            {!selectedDeviceType ? (
              <div className="text-center py-6 text-gray-500">
                <p>먼저 장비 타입을 선택해주세요</p>
              </div>
            ) : loadingFrameworks ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">로딩...</span>
              </div>
            ) : (
              <>
                {/* 그리드 형태로 단순화 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {compatibleFrameworks.map(framework => {
                    const info = getFrameworkInfo(framework.id);
                    const isSelected = selectedFrameworks.includes(framework.id);

                    return (
                      <label
                        key={framework.id}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e =>
                            handleFrameworkToggle(framework.id, e.target.checked)
                          }
                          className="sr-only"
                          disabled={isAnalyzing}
                        />
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {framework.id}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {framework.total_rules && (
                              <span className="text-xs text-gray-500">
                                {framework.total_rules}룰
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {framework.description}
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {compatibleFrameworks.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    지원되는 지침서가 없습니다.
                  </div>
                )}
              </>
            )}
            
            {/* 선택 요약 */}
            {selectedFrameworks.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900">
                  선택된 지침서: {selectedFrameworks.join(', ')} 
                  <span className="text-xs text-blue-700 ml-2">
                    ({selectedFrameworks.length === 1 ? '단일 분석' : '비교 분석'})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Area - 단순화 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              3. 설정 파일 업로드
            </h3>
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
                  <svg
                    className="w-12 h-12 text-green-500 mb-4"
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
                  <p className="text-lg font-medium text-green-600">
                    파일 선택 완료
                  </p>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    크기: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  {!isAnalyzing && (
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      다른 파일 선택
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    파일을 드래그하거나 
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="text-blue-600 hover:text-blue-500 underline ml-1"
                      disabled={isAnalyzing}
                    >
                      찾아보기
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    .txt, .cfg, .conf, .xml, .log (최대 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - 중앙 정렬 */}
          <div className="text-center space-y-3">
            <button
              onClick={handleAnalyzeClick}
              disabled={
                !selectedFile ||
                !selectedDeviceType ||
                selectedFrameworks.length === 0 ||
                isAnalyzing
              }
              className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-medium transition-colors ${
                selectedFile &&
                selectedDeviceType &&
                selectedFrameworks.length > 0 &&
                !isAnalyzing
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  보안 분석 시작
                </>
              )}
            </button>
            
            {(selectedFile || analysisError) && (
              <div>
                <button
                  onClick={handleReset}
                  disabled={isAnalyzing}
                  className="text-sm text-gray-600 hover:text-gray-700 underline disabled:opacity-50"
                >
                  초기화
                </button>
              </div>
            )}
          </div>

          {/* Analysis Progress - 단순화 */}
          {isAnalyzing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">
                  {selectedFrameworks.length > 1 
                    ? `${selectedFrameworks.length}개 지침서로 분석 진행중...` 
                    : `${selectedFrameworks[0]} 지침서로 분석 진행중...`
                  }
                </span>
              </div>
              <p className="text-center text-sm text-blue-600 mt-2">
                평균 3-5분 소요됩니다
              </p>
            </div>
          )}
        </div>
        
        {/* 간단한 도움말 */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">팁</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Cisco, Juniper 장비는 최다 룰 지원으로 상세 분석 가능</li>
            <li>• 여러 지침서 선택 시 비교 분석 결과 제공</li>
            <li>• 업로드된 파일은 분석 후 즉시 삭제됨</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;