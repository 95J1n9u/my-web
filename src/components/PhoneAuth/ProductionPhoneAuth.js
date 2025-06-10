// 🚀 출시용 SMS 인증 시스템 - 완전 수정판
import React, { useState, useEffect } from 'react';
import { auth, authService } from '../../config/firebase';
import { validatePhoneNumber, formatPhoneNumber } from '../../utils/phoneValidation';

const ProductionPhoneAuth = ({ onVerificationSuccess, onError, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [step, setStep] = useState('phone'); // 'phone', 'code', 'success'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // reCAPTCHA 초기화 (출시용 안정화)
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        console.log('🚀 출시용 reCAPTCHA 초기화 시작');
        
        // 기존 reCAPTCHA 정리
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            console.warn('기존 reCAPTCHA 정리:', e);
          }
          window.recaptchaVerifier = null;
        }

        // DOM 컨테이너 확인 및 생성
        let container = document.getElementById('production-recaptcha');
        if (!container) {
          container = document.createElement('div');
          container.id = 'production-recaptcha';
          container.style.margin = '10px 0';
          
          // 현재 컴포넌트에 추가
          const currentContainer = document.querySelector('.sms-auth-container');
          if (currentContainer) {
            currentContainer.appendChild(container);
          } else {
            document.body.appendChild(container);
          }
        }

        // 환경변수에서 reCAPTCHA 키 확인
        const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
        if (!siteKey || siteKey.includes('여기에')) {
          throw new Error('reCAPTCHA 사이트 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
        }

        console.log('🔑 reCAPTCHA 사이트 키 확인됨:', siteKey.substring(0, 10) + '...');

        const result = await authService.phone.setupRecaptcha('production-recaptcha');
        
        if (result.success) {
          setRecaptchaReady(true);
          console.log('✅ 출시용 reCAPTCHA 설정 성공');
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ reCAPTCHA 초기화 실패:', error);
        setError(`보안 인증 설정 실패: ${error.message}`);
        
        // Firebase Console 설정 가이드 제공
        if (error.message.includes('사이트 키')) {
          setError(
            '❌ reCAPTCHA 설정이 필요합니다.\n' +
            '1. Google reCAPTCHA 콘솔에서 새 키 생성\n' +
            '2. Firebase Console → App Check → reCAPTCHA v3 설정\n' +
            '3. 환경변수에 사이트 키 추가\n' +
            '자세한 내용은 RECAPTCHA_SETUP_GUIDE.md를 참조하세요.'
          );
        }
      }
    };

    initRecaptcha();

    // 정리 함수
    return () => {
      try {
        authService.phone.cleanupRecaptcha();
        const container = document.getElementById('production-recaptcha');
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch (error) {
        console.warn('reCAPTCHA 정리 중 오류:', error);
      }
    };
  }, []);

  // 🔥 휴대폰 번호 중복 확인 (출시 핵심 기능)
  const checkPhoneNumberDuplicate = async (phoneNumber) => {
    setIsCheckingDuplicate(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('🔍 휴대폰 번호 중복 확인:', formattedPhone);

      // Firestore에서 중복 확인
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      if (!db) {
        throw new Error('데이터베이스 연결 실패');
      }

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('phoneNumber', '==', formattedPhone),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      const isDuplicate = !querySnapshot.empty;
      
      if (isDuplicate) {
        const existingUser = querySnapshot.docs[0].data();
        console.log('⚠️ 중복된 휴대폰 번호 발견:', existingUser.email);
        
        return {
          isDuplicate: true,
          existingEmail: existingUser.email,
          message: `이미 ${existingUser.email} 계정에서 사용 중인 휴대폰 번호입니다.`
        };
      }
      
      console.log('✅ 휴대폰 번호 사용 가능');
      return { isDuplicate: false };
      
    } catch (error) {
      console.error('❌ 중복 확인 실패:', error);
      throw new Error(`휴대폰 번호 확인 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // SMS 발송
  const sendSMS = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setError('올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    if (!recaptchaReady) {
      setError('보안 인증이 준비되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🔥 1단계: 휴대폰 번호 중복 확인
      const duplicateCheck = await checkPhoneNumberDuplicate(phoneNumber);
      
      if (duplicateCheck.isDuplicate) {
        setError(
          `❌ ${duplicateCheck.message}\n\n` +
          '이미 가입된 번호입니다. 다른 번호를 사용하거나 기존 계정으로 로그인해주세요.'
        );
        return;
      }

      // 2단계: SMS 발송
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('📱 SMS 발송 시도:', formattedPhone);

      const result = await authService.phone.sendVerificationCode(formattedPhone);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('code');
        console.log('✅ SMS 발송 성공');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ SMS 발송 실패:', error);
      
      // 상세한 에러 메시지 제공
      let userMessage = error.message;
      
      if (error.message.includes('휴대폰 번호 확인')) {
        userMessage = error.message;
      } else if (error.message.includes('Blaze')) {
        userMessage = '❌ Firebase 프로젝트를 Blaze 플랜으로 업그레이드해야 SMS 발송이 가능합니다.';
      } else if (error.message.includes('quota')) {
        userMessage = '❌ SMS 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('domain')) {
        userMessage = '❌ 현재 도메인이 Firebase에서 승인되지 않았습니다. 관리자에게 문의하세요.';
      }
      
      setError(userMessage);
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

    setIsLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(smsCode);
      
      if (result.user) {
        // 🔥 중요: 자동 로그인 방지 (회원가입용)
        await auth.signOut();
        
        setStep('success');
        console.log('✅ SMS 인증 성공:', formatPhoneNumber(phoneNumber));
        
        if (onVerificationSuccess) {
          onVerificationSuccess(formatPhoneNumber(phoneNumber));
        }
      }
    } catch (error) {
      console.error('❌ 인증번호 확인 실패:', error);
      
      let errorMessage = '인증번호 확인에 실패했습니다.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = '❌ 잘못된 인증번호입니다. 다시 확인해주세요.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = '❌ 인증번호가 만료되었습니다. 다시 발송받아주세요.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '❌ 너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 처음부터 다시 시작
  const resetProcess = () => {
    setStep('phone');
    setPhoneNumber('');
    setSmsCode('');
    setConfirmationResult(null);
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="sms-auth-container space-y-4 p-4 border border-gray-300 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">📱 휴대폰 인증</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-1234-5678"
              disabled={isLoading || isCheckingDuplicate}
            />
            <p className="text-xs text-gray-500 mt-1">
              가입 시 사용할 휴대폰 번호를 입력하세요. 동일 번호로 중복 가입은 불가능합니다.
            </p>
          </div>

          {/* reCAPTCHA 상태 표시 */}
          <div className="p-3 bg-gray-50 border rounded-lg">
            {recaptchaReady ? (
              <p className="text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                보안 인증 준비 완료
              </p>
            ) : (
              <p className="text-sm text-gray-600 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                보안 인증 로딩 중...
              </p>
            )}
          </div>

          <button
            onClick={sendSMS}
            disabled={isLoading || !recaptchaReady || !phoneNumber || isCheckingDuplicate}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              recaptchaReady && phoneNumber && !isLoading && !isCheckingDuplicate
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                발송 중...
              </span>
            ) : isCheckingDuplicate ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                중복 확인 중...
              </span>
            ) : (
              '인증번호 받기'
            )}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📱 {formatPhoneNumber(phoneNumber)}로 인증번호가 발송되었습니다.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              인증번호는 5분간 유효합니다.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">인증번호 (6자리)</label>
            <input
              type="text"
              value={smsCode}
              onChange={(e) => {
                setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
              disabled={isLoading}
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={verifyCode}
              disabled={isLoading || smsCode.length !== 6}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                smsCode.length === 6 && !isLoading
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  확인 중...
                </span>
              ) : (
                '인증 완료'
              )}
            </button>

            <button
              onClick={resetProcess}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
            {formatPhoneNumber(phoneNumber)}
          </div>
          <div className="text-xs text-green-500 mt-2">
            이제 이 번호로 회원가입을 완료하세요.
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}

      {/* 출시용 중요 안내 */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-800 mb-1">🔐 보안 안내</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• 실제 SMS가 발송됩니다 (통신사 요금 발생)</li>
          <li>• 동일한 휴대폰 번호로는 중복 가입이 불가능합니다</li>
          <li>• 인증번호는 5분간 유효하며, 6회 틀리면 새로 받아야 합니다</li>
          <li>• 보안을 위해 인증 후 자동 로그인되지 않습니다</li>
        </ul>
      </div>

      {/* reCAPTCHA 컨테이너 (숨김) */}
      <div id="production-recaptcha" style={{ height: '0px', overflow: 'hidden' }}></div>
    </div>
  );
};

export default ProductionPhoneAuth;
