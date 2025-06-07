import React, { useState } from 'react';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

const LegalNotices = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">법적 고지사항</h1>
        <p className="text-gray-600">
          NetSecure 서비스 이용과 관련된 약관 및 정책을 확인하세요
        </p>
      </div>

      {/* Legal Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terms of Service Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">서비스 이용약관</h3>
              <p className="text-sm text-gray-600 mb-4">
                NetSecure 서비스 이용에 관한 기본적인 조건과 절차, 회사와 이용자의 권리 및 의무사항을 규정한 약관입니다.
              </p>
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <p><strong>최종 수정일:</strong> 2024년 12월 1일</p>
                <p><strong>시행일:</strong> 2024년 1월 1일</p>
              </div>
              <button
                onClick={() => setShowTerms(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                전문 보기
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Policy Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4m8 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">개인정보처리방침</h3>
              <p className="text-sm text-gray-600 mb-4">
                개인정보보호법에 따라 이용자의 개인정보 처리 현황과 보호 조치에 관한 사항을 안내하는 방침입니다.
              </p>
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <p><strong>최종 수정일:</strong> 2024년 12월 1일</p>
                <p><strong>시행일:</strong> 2024년 1월 1일</p>
              </div>
              <button
                onClick={() => setShowPrivacy(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                전문 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">서비스 특성</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 네트워크 설정 파일은 분석 완료 즉시 삭제</li>
              <li>• 분석 결과만 암호화하여 개인 계정에 저장</li>
              <li>• 업로드 파일 내용은 분석 외 목적으로 사용하지 않음</li>
              <li>• 모든 통신은 HTTPS로 암호화 전송</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">연락처</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>서비스 문의:</strong> support@netsecure.com</p>
              <p><strong>개인정보 문의:</strong> privacy@netsecure.com</p>
              <p><strong>고객센터:</strong> 1588-0000 (평일 09:00-18:00)</p>
              <p><strong>운영시간:</strong> 24시간 (연중무휴)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">보안 및 개인정보보호</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• NetSecure는 이용자의 개인정보 보호를 최우선으로 합니다.</p>
              <p>• 모든 데이터는 Firebase의 보안 기준에 따라 암호화되어 저장됩니다.</p>
              <p>• 개인정보 관련 문의사항이 있으시면 언제든지 연락주시기 바랍니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Update History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">업데이트 이력</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              2024.12.01
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">다중 지침서 분석 기능 추가에 따른 약관 개정</p>
              <p className="text-xs text-gray-500">KISA, CIS, NW 지침서 동시 분석 기능 관련 조항 추가</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              2024.06.15
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">커뮤니티 기능 추가에 따른 개인정보처리방침 개정</p>
              <p className="text-xs text-gray-500">게시판 이용 관련 개인정보 처리 내용 추가</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              2024.01.01
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">NetSecure 서비스 최초 출시</p>
              <p className="text-xs text-gray-500">서비스 이용약관 및 개인정보처리방침 최초 제정</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <TermsOfService onClose={() => setShowTerms(false)} />
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
      )}
    </div>
  );
};

export default LegalNotices;