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
        <h1 className="text-3xl font-bold text-gray-900">File Upload</h1>
        <p className="text-gray-600">Upload network device configuration files for security analysis</p>
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
                <p className="text-lg font-medium text-blue-600">Analyzing Configuration...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-green-600">File Uploaded Successfully</p>
                <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Upload Another File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your config file here, or 
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="text-blue-600 hover:text-blue-500 ml-1"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">Supports .txt, .cfg, .conf, .xml files up to 10MB</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isAnalyzing && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Parsing configuration...</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Security policy analysis...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vulnerability detection...</span>
                  <span className="text-sm text-gray-400">Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Report generation...</span>
                  <span className="text-sm text-gray-400">Pending</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Supported Formats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Formats</h3>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Features</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Security Policy Review</p>
                  <p className="text-xs text-gray-500">Analyze access control lists and firewall rules</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vulnerability Detection</p>
                  <p className="text-xs text-gray-500">Identify known security vulnerabilities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Compliance Checking</p>
                  <p className="text-xs text-gray-500">Verify against security standards</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Best Practices</p>
                  <p className="text-xs text-gray-500">Recommendations for improvement</p>
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
                <p className="text-sm font-medium text-blue-900">Security Notice</p>
                <p className="text-xs text-blue-700">
                  All uploaded files are processed securely and are not stored permanently. 
                  Files are automatically deleted after analysis completion.
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