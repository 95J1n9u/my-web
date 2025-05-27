import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileUpload, uploadedFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      setIsAnalyzing(true);
      onFileUpload(file);
      // 분석 시뮬레이션 후 상태 리셋
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const supportedFormats = [
    { name: 'Cisco IOS', extension: '.txt, .cfg' },
    { name: 'Juniper JunOS', extension: '.conf, .txt' },
    { name: 'Fortinet FortiOS', extension: '.conf, .txt' },
    { name: 'Palo Alto PAN-OS', extension: '.xml, .txt' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">파일 업로드</h1>
        <p className="text-gray-600">보안 분석을 위한 네트워크 장비 설정 파일을 업로드하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : uploadedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".txt,.cfg,.conf,.xml"
              className="hidden"
            />
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium text-blue-600">설정 파일 분석 중...</p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-green-600">파일 업로드 완료</p>
                <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  다른 파일 업로드
                </button>
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
                  >
                    찾아보기
                  </button>
                </p>
                <p className="text-sm text-gray-500">최대 10MB까지 .txt, .cfg, .conf, .xml 파일 지원</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 진행 상황</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">설정 파일 파싱...</span>
                  <span className="text-sm font-medium text-green-600">✓ 완료</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">보안 정책 분석...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">취약점 탐지...</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">분석 기능</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">보안 정책 검토</p>
                  <p className="text-xs text-gray-500">접근 제어 목록 및 방화벽 규칙 분석</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">취약점 탐지</p>
                  <p className="text-xs text-gray-500">알려진 보안 취약점 식별</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">컴플라이언스 검사</p>
                  <p className="text-xs text-gray-500">보안 표준 준수 여부 확인</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">모범 사례</p>
                  <p className="text-xs text-gray-500">개선을 위한 권장 사항</p>
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
                <p className="text-sm font-medium text-blue-900">보안 알림</p>
                <p className="text-xs text-blue-700">
                  업로드된 모든 파일은 안전하게 처리되며 영구적으로 저장되지 않습니다. 
                  분석 완료 후 파일은 자동으로 삭제됩니다.
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