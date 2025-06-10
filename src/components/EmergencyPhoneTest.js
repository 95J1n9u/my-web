import React from 'react';
import EmergencyPhoneAuth from '../components/PhoneAuth/EmergencyPhoneAuth';

const EmergencyPhoneTest = () => {
  const handleVerificationSuccess = (phoneNumber) => {
    console.log('✅ 인증 성공:', phoneNumber);
    alert(`✅ 휴대폰 인증 성공!\n번호: ${phoneNumber}`);
  };

  const handleError = (error) => {
    console.error('❌ 인증 오류:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            🚨 긴급 SMS 인증 테스트
          </h1>
          
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 주의:</strong> 실제 SMS가 발송됩니다. (약 60원/건)
            </p>
          </div>

          <EmergencyPhoneAuth 
            onVerificationSuccess={handleVerificationSuccess}
            onError={handleError}
          />

          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>• 실제 휴대폰 번호를 입력하세요</p>
            <p>• reCAPTCHA 보안 인증을 완료하세요</p>
            <p>• SMS로 받은 6자리 인증번호를 입력하세요</p>
            <p>• 인증번호는 5분간 유효합니다</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPhoneTest;
