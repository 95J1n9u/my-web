import React, { useState, useEffect } from 'react';
import { auth, authService } from '../../config/firebase';
import { validatePhoneNumber, formatPhoneNumber } from '../../utils/phoneValidation';

const SimplePhoneAuth = ({ onVerificationSuccess, onError }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone', 'code', 'success'
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // 컴포넌트 마운트 시 reCAPTCHA 초기화
  useEffect(() => {
    initializeRecaptcha();
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  // reCAPTCHA 초기화 (firebase.js의 phoneAuthService 사용)
  const initializeRecaptcha = async () => {
    try {
      setDebugInfo('reCAPTCHA 초기화 시작...');
      setError('');
      setIsRecaptchaReady(false);
      
      // firebase.js의 phoneAuthService 사용
      const result = await authService.phone.setupRecaptcha('recaptcha-container-simple');
      
      if (result.success) {
        setIsRecaptchaReady(true);
        setDebugInfo('reCAPTCHA 로드 완료');
        console.log('✅ reCAPTCHA 설정 성공');
      } else {
        setError(result.error || 'reCAPTCHA 설정에 실패했습니다.');
        setDebugInfo('reCAPTCHA 설정 실패: ' + (result.error || 'Unknown error'));
        console.error('❌ reCAPTCHA 설정 실패:', result.error);
      }
      
    } catch (error) {
      console.error('❌ reCAPTCHA 초기화 실패:', error);
      setError('reCAPTCHA 초기화에 실패했습니다: ' + error.message);
      setDebugInfo('초기화 실패: ' + error.message);
    }
  };

  // reCAPTCHA 정리 (firebase.js의 phoneAuthService 사용)
  const cleanupRecaptcha = () => {
    try {
      authService.phone.cleanupRecaptcha();
      setIsRecaptchaReady(false);
      console.log('✅ reCAPTCHA 정리 완료');
    } catch (error) {
      console.warn('⚠️ reCAPTCHA 정리 중 오류:', error);
    }
  };

  // SMS 인증번호 발송 (firebase.js의 phoneAuthService 사용)
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      setError('휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    if (!isRecaptchaReady) {
      setError('reCAPTCHA가 준비되지 않았습니다. 잠시 기다려주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setDebugInfo('SMS 발송 중...');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('📱 SMS 발송 시도:', formattedPhone);

      // firebase.js의 phoneAuthService 사용
      const result = await authService.phone.sendVerificationCode(formattedPhone);
      
      if (result.success) {
        console.log('✅ SMS 발송 성공');
        setConfirmationResult(result.confirmationResult);
        setStep('code');
        setDebugInfo(`인증번호가 ${formattedPhone}로 발송되었습니다.`);
      } else {
        console.error('❌ SMS 발송 실패:', result.error);
        setError(result.error || 'SMS 발송에 실패했습니다.');
        setDebugInfo(`SMS 발송 실패: ${result.error || 'Unknown error'}`);
        
        // reCAPTCHA 재초기화 (발송 실패시)
        setTimeout(() => {
          cleanupRecaptcha();
          initializeRecaptcha();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ SMS 발송 예외:', error);
      setError('예기치 못한 오류가 발생했습니다: ' + error.message);
      setDebugInfo(`예외 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setError('6자리 인증번호를 정확히 입력해주세요.');
      return;
    }

    if (!confirmationResult) {
      setError('먼저 인증번호를 받아주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setDebugInfo('인증번호 확인 중...');

    try {
      const result = await confirmationResult.confirm(smsCode);
      console.log('✅ 휴대폰 인증 성공:', result.user);

      // 즉시 로그아웃 (회원가입 과정에서만 인증용)
      await auth.signOut();
      
      setStep('success');
      setDebugInfo('휴대폰 인증이 완료되었습니다!');
      
      if (onVerificationSuccess) {
        onVerificationSuccess(formatPhoneNumber(phoneNumber));
      }

    } catch (error) {
      console.error('❌ 인증번호 확인 실패:', error);
      handleError(error, '인증번호 확인');
    } finally {
      setIsLoading(false);
    }
  };

  // 간단한 에러 처리 (구체적인 에러 처리는 firebase.js에서 수행)
  const handleError = (error, context = '') => {
    const errorMessage = error.message || error || '알 수 없는 오류가 발생했습니다.';
    setError(errorMessage);
    setDebugInfo(`${context ? context + ': ' : ''}${errorMessage}`);
    
    if (onError) {
      onError(error);
    }
  };

  // 처음부터 다시 시작
  const resetFlow = () => {
    setStep('phone');
    setPhoneNumber('');
    setSmsCode('');
    setConfirmationResult(null);
    setError('');
    setDebugInfo('');
    cleanupRecaptcha();
    setTimeout(initializeRecaptcha, 500);
  };

  return (
    <div className="space-y-4">
      {/* 진행 단계 표시 */}
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'phone' ? 'bg-blue-500 text-white' : 
          step === 'code' || step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          1
        </div>
        <div className={`flex-1 h-1 ${
          step === 'code' || step === 'success' ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'code' ? 'bg-blue-500 text-white' : 
          step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          2
        </div>
        <div className={`flex-1 h-1 ${
          step === 'success' ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
        }`}>
          ✓
        </div>
      </div>

      {/* 1단계: 휴대폰 번호 입력 */}
      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴대폰 번호 *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-1234-5678"
              disabled={isLoading}
            />
          </div>

          {/* reCAPTCHA 컨테이너 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">보안 인증:</div>
            <div id="recaptcha-container-simple"></div>
          </div>

          <button
            onClick={sendVerificationCode}
            disabled={!phoneNumber || isLoading || !isRecaptchaReady}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              phoneNumber && isRecaptchaReady && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '발송 중...' : '인증번호 받기'}
          </button>
        </div>
      )}

      {/* 2단계: 인증번호 입력 */}
      {step === 'code' && (
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">
              📱 {formatPhoneNumber(phoneNumber)}로<br />
              인증번호가 발송되었습니다.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              인증번호 (6자리) *
            </label>
            <input
              type="text"
              value={smsCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setSmsCode(value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="123456"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={verifyCode}
              disabled={smsCode.length !== 6 || isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                smsCode.length === 6 && !isLoading
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? '확인 중...' : '인증 완료'}
            </button>

            <button
              onClick={resetFlow}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              다시 받기
            </button>
          </div>
        </div>
      )}

      {/* 3단계: 완료 */}
      {step === 'success' && (
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <div className="text-lg font-medium text-green-800 mb-2">
            휴대폰 인증 완료!
          </div>
          <div className="text-sm text-green-600">
            {formatPhoneNumber(phoneNumber)} 인증이 완료되었습니다.
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* 디버그 정보 (개발환경에서만) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="p-3 bg-gray-100 border rounded-lg">
          <div className="text-xs text-gray-600">
            <strong>디버그:</strong> {debugInfo}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Firebase Project: {auth?.app?.options?.projectId}<br />
            reCAPTCHA Ready: {isRecaptchaReady ? '✅' : '❌'}<br />
            Current Step: {step}
          </div>
        </div>
      )}

      {/* Firebase 설정 체크리스트 (개발환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
            🔧 Firebase 설정 체크리스트 (개발자용)
          </summary>
          <div className="mt-2 text-xs text-yellow-700 space-y-1">
            <div>✅ Firebase Console → Authentication → Sign-in method → Phone 활성화</div>
            <div>🔥 Firebase 프로젝트를 Blaze 플랜으로 업그레이드 (SMS 발송 필수)</div>
            <div>✅ Authorized domains에 localhost 추가</div>
            <div>⚠️ App Check 비활성화 (개발 중)</div>
            <div>📱 테스트 전화번호: +82 10-1234-5678 (인증코드: 123456)</div>
          </div>
        </details>
      )}
    </div>
  );
};

export default SimplePhoneAuth;