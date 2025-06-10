// 🔥 긴급 reCAPTCHA 문제 해결을 위한 간단한 Phone Auth 컴포넌트

import React, { useState, useEffect } from 'react';
import { auth, authService } from '../../config/firebase';
import { validatePhoneNumber, formatPhoneNumber } from '../../utils/phoneValidation';

const EmergencyPhoneAuth = ({ onVerificationSuccess, onError }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState('phone'); // 'phone', 'code', 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // 간단한 reCAPTCHA 초기화
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        console.log('🔥 긴급 reCAPTCHA 초기화 시작');
        
        // DOM 컨테이너 생성
        let container = document.getElementById('emergency-recaptcha');
        if (!container) {
          container = document.createElement('div');
          container.id = 'emergency-recaptcha';
          container.style.margin = '10px 0';
          document.body.appendChild(container);
        }

        const result = await authService.phone.setupRecaptcha('emergency-recaptcha');
        
        if (result.success) {
          setRecaptchaReady(true);
          console.log('✅ 긴급 reCAPTCHA 설정 성공');
        } else {
          setError('reCAPTCHA 설정 실패: ' + result.error);
          console.error('❌ 긴급 reCAPTCHA 설정 실패:', result.error);
        }
      } catch (error) {
        console.error('긴급 reCAPTCHA 초기화 오류:', error);
        setError('reCAPTCHA 초기화 실패');
      }
    };

    initRecaptcha();

    // 정리
    return () => {
      try {
        authService.phone.cleanupRecaptcha();
        const container = document.getElementById('emergency-recaptcha');
        if (container) {
          container.remove();
        }
      } catch (error) {
        console.warn('reCAPTCHA 정리 중 오류:', error);
      }
    };
  }, []);

  // SMS 발송
  const sendSMS = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!recaptchaReady) {
      setError('reCAPTCHA 보안 인증을 먼저 완료해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('📱 SMS 발송 시도:', formattedPhone);

      const result = await authService.phone.sendVerificationCode(formattedPhone);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('code');
        console.log('✅ SMS 발송 성공');
      } else {
        setError(result.error);
        console.error('❌ SMS 발송 실패:', result.error);
      }
    } catch (error) {
      console.error('SMS 발송 예외:', error);
      setError('SMS 발송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(smsCode);
      
      if (result.user) {
        // 자동 로그인 방지
        await auth.signOut();
        
        setStep('success');
        if (onVerificationSuccess) {
          onVerificationSuccess(formatPhoneNumber(phoneNumber));
        }
      }
    } catch (error) {
      console.error('인증번호 확인 실패:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError('잘못된 인증번호입니다.');
      } else if (error.code === 'auth/code-expired') {
        setError('인증번호가 만료되었습니다. 다시 받아주세요.');
      } else {
        setError('인증 확인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-medium">📱 긴급 SMS 인증</h3>
      
      {step === 'phone' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">휴대폰 번호</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="010-1234-5678"
              disabled={isLoading}
            />
          </div>

          {/* 간단한 reCAPTCHA 상태 표시 */}
          <div className="p-3 bg-gray-50 border rounded-lg">
            {recaptchaReady ? (
              <p className="text-sm text-green-600">✅ 보안 인증 준비됨</p>
            ) : (
              <p className="text-sm text-gray-600">🔄 보안 인증 로딩 중...</p>
            )}
          </div>

          <button
            onClick={sendSMS}
            disabled={isLoading || !recaptchaReady || !phoneNumber}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              recaptchaReady && phoneNumber && !isLoading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {isLoading ? '발송 중...' : '인증번호 받기'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="space-y-3">
          <p className="text-sm text-blue-600">
            📱 {formatPhoneNumber(phoneNumber)}로 인증번호가 발송되었습니다.
          </p>
          
          <div>
            <label className="block text-sm font-medium mb-1">인증번호 (6자리)</label>
            <input
              type="text"
              value={smsCode}
              onChange={(e) => {
                setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl"
              placeholder="123456"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={verifyCode}
              disabled={isLoading || smsCode.length !== 6}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                smsCode.length === 6 && !isLoading
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isLoading ? '확인 중...' : '인증 완료'}
            </button>

            <button
              onClick={() => {
                setStep('phone');
                setSmsCode('');
                setConfirmationResult(null);
                setError('');
              }}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              다시하기
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-600 text-4xl mb-2">✅</div>
          <div className="text-lg font-medium text-green-800 mb-1">
            휴대폰 인증 완료!
          </div>
          <div className="text-sm text-green-600">
            {formatPhoneNumber(phoneNumber)} 인증이 완료되었습니다.
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 디버깅 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <div>reCAPTCHA 상태: {recaptchaReady ? '✅' : '❌'}</div>
          <div>Firebase Auth: {auth ? '✅' : '❌'}</div>
          <div>현재 단계: {step}</div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPhoneAuth;
