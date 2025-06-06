import React, { useState } from 'react';
import LoginModal from './LoginModal';

const SignupPromptModal = ({ isOpen, onClose, onLoginSuccess, analysisResults }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isOpen) return null;

  const handleLoginSuccess = (userData) => {
    setShowLoginModal(false);
    onLoginSuccess(userData);
    onClose();
  };

  const handleStartLogin = () => {
    setShowLoginModal(true);
  };

  const handleCloseLogin = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      {/* 회원가입 유도 팝업 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">분석 완료!</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* 분석 결과 요약 */}
            {analysisResults && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">분석 결과 요약</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">총 검사 항목:</span>
                    <span className="font-medium ml-1">{analysisResults.summary?.totalChecks || 0}개</span>
                  </div>
                  <div>
                    <span className="text-blue-700">발견된 취약점:</span>
                    <span className="font-medium ml-1 text-red-600">{analysisResults.summary?.vulnerabilities || 0}개</span>
                  </div>
                  <div>
                    <span className="text-blue-700">보안 점수:</span>
                    <span className="font-medium ml-1 text-green-600">
                      {analysisResults.summary?.totalChecks ? 
                        Math.round(((analysisResults.summary.totalChecks - (analysisResults.summary.vulnerabilities || 0)) / analysisResults.summary.totalChecks) * 100)
                        : 0}점
                      </span>
                  </div>
                  <div>
                    <span className="text-blue-700">분석 지침서:</span>
                    <span className="font-medium ml-1">{analysisResults.metadata?.framework || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                계정을 만들어 더 많은 기능을 이용하세요!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                회원가입하시면 분석 기록 저장, 통계 조회 등의 추가 기능을 무료로 이용할 수 있습니다.
              </p>
            </div>

            {/* 혜택 목록 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">분석 결과 자동 저장</p>
                  <p className="text-xs text-gray-500">언제든지 과거 분석 기록을 조회할 수 있습니다</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">개인화된 대시보드</p>
                  <p className="text-xs text-gray-500">나만의 보안 분석 통계와 트렌드를 확인하세요</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">분석 기록 관리</p>
                  <p className="text-xs text-gray-500">분석 결과를 정리하고 비교할 수 있습니다</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">무제한 분석</p>
                  <p className="text-xs text-gray-500">횟수 제한 없이 자유롭게 분석하세요</p>
                </div>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={handleStartLogin}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                지금 회원가입하기
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                나중에 하기 (결과 보기)
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Google 계정으로 간편하게 회원가입할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseLogin}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default SignupPromptModal;