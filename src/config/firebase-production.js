// 🚀 출시용 Firebase 9.x SDK (매우 안정화)
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  connectAuthEmulator,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  getDocs,
  where,
  serverTimestamp,
  connectFirestoreEmulator,
  increment,
} from 'firebase/firestore';

// 🚀 App Check는 출시에서만 사용
import { getAppCheck, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

console.log('🚀 출시용 firebase.js 로드됨');

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyBz7XX1dbo7UU14AD4jJ1-2EFwxOWoP1bU',
  authDomain: 'net-30335.firebaseapp.com',
  projectId: 'net-30335',
  storageBucket: 'net-30335.appspot.com',
  messagingSenderId: '44418901752',
  appId: '1:44418901752:web:f246bd4d454b15c9a6bd0d',
  measurementId: 'G-05KS19EF7J',
};

// Firebase 초기화
let app;
let auth;
let db;
let appCheck;

try {
  app = initializeApp(firebaseConfig);
  
  // 🚀 출시용 App Check 설정
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const disableAppCheck = process.env.REACT_APP_DISABLE_APP_CHECK === 'true';
    
    if (!disableAppCheck && isProduction) {
      // 프로덕션에서만 App Check 사용
      const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
      
      if (siteKey && !siteKey.includes('여기에')) {
        console.log('🚀 프로덕션 App Check 초기화:', siteKey.substring(0, 10) + '...');
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
        console.log('✅ App Check 초기화 성공');
      } else {
        console.warn('⚠️ 프로덕션 reCAPTCHA 사이트 키 누락');
        appCheck = null;
      }
    } else {
      console.log('🚀 App Check 비활성화 (개발 환경 또는 설정)');
      
      // 개발 환경에서 debug 토큰 설정
      if (!isProduction && typeof window !== 'undefined') {
        window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        console.log('✅ App Check debug 토큰 설정');
      }
      
      appCheck = null;
    }
  } catch (appCheckError) {
    console.warn('⚠️ App Check 초기화 실패:', appCheckError.message);
    appCheck = null;
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  // 🚀 Phone Authentication 설정
  auth.languageCode = 'ko';
  
  console.log('📊 Firebase 초기화 상태:');
  console.log('- App:', !!app);
  console.log('- Auth:', !!auth);
  console.log('- Firestore:', !!db);
  console.log('- App Check:', !!appCheck, appCheck ? '(활성화)' : '(비활성화)');
  console.log('- 환경:', process.env.NODE_ENV);
  
  console.log('✅ Firebase 초기화 성공');
  
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  auth = null;
  db = null;
  appCheck = null;
}

// Firebase 서비스들을 안전하게 export
export { auth, db, appCheck };

// 개발 환경에서 에뮬레이터 사용 (선택사항)
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🚀 Firebase 에뮬레이터 연결 완료');
  } catch (error) {
    console.log('🚀 Firebase 에뮬레이터 연결 실패 (정상)', error.message);
  }
}

// Google Auth Provider 설정
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '',
});

// 디버깅을 위한 로그 함수
const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Firebase Debug] ${message}`, data || '');
  }
};

// Firebase 서비스 가용성 확인 함수
const checkFirebaseServices = () => {
  if (!auth || !db) {
    throw new Error(
      'Firebase 서비스가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
    );
  }
};

// 🚀 출시용 Phone Authentication 서비스 (완전 안정화)
const phoneAuthService = {
  // 초기화
  init: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 출시용 Phone Auth 서비스 초기화');
      
      // 환경변수 확인
      const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
      if (!siteKey || siteKey.includes('여기에')) {
        console.warn('⚠️ reCAPTCHA 사이트 키가 설정되지 않았습니다!');
        console.log('🔧 .env.production 파일에서 REACT_APP_RECAPTCHA_SITE_KEY를 설정하세요.');
      } else {
        console.log('✅ reCAPTCHA 사이트 키 확인됨:', siteKey.substring(0, 10) + '...');
      }
    }
  },

  // 🚀 출시용 reCAPTCHA 설정 (안정화)
  setupRecaptcha: (containerId = 'recaptcha-container') => {
    try {
      checkFirebaseServices();
      
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('❌ reCAPTCHA 컨테이너를 찾을 수 없습니다:', containerId);
        return Promise.resolve({ 
          success: false, 
          error: 'reCAPTCHA 컨테이너가 존재하지 않습니다.' 
        });
      }

      // 기존 reCAPTCHA 정리
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('기존 reCAPTCHA 정리 중 오류:', e);
        }
        window.recaptchaVerifier = null;
      }

      container.innerHTML = '';

      console.log('🚀 안정화된 RecaptchaVerifier 생성');
      
      // 🚀 더 안정적인 reCAPTCHA 설정
      const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        theme: 'light',
        callback: (response) => {
          console.log('✅ reCAPTCHA 인증 완료:', response?.substring(0, 20) + '...');
        },
        'expired-callback': () => {
          console.log('⚠️ reCAPTCHA 만료됨');
        },
        'error-callback': (error) => {
          console.error('❌ reCAPTCHA 에러:', error);
        }
      });

      console.log('🚀 reCAPTCHA 렌더링 시작...');
      
      return recaptchaVerifier.render().then((widgetId) => {
        console.log('✅ reCAPTCHA 렌더링 성공! Widget ID:', widgetId);
        
        window.recaptchaVerifier = recaptchaVerifier;
        window.recaptchaWidgetId = widgetId;
        
        // DOM 확인을 위한 약간의 지연
        return new Promise((resolve) => {
          setTimeout(() => {
            const recaptchaWidget = container.querySelector('iframe') || 
                                  container.querySelector('[data-sitekey]') ||
                                  container.firstElementChild;
            
            if (recaptchaWidget || container.children.length > 0) {
              console.log('✅ reCAPTCHA DOM 요소 확인됨');
              resolve({ success: true, widgetId, rendered: true });
            } else {
              console.warn('⚠️ reCAPTCHA DOM 요소 미확인, 하지만 위젯 생성됨');
              resolve({ 
                success: !!window.recaptchaVerifier, 
                widgetId, 
                rendered: !!window.recaptchaVerifier 
              });
            }
          }, 2000); // 2초 대기로 증가
        });
      }).catch((error) => {
        console.error('❌ reCAPTCHA 렌더링 실패:', error);
        
        window.recaptchaVerifier = null;
        window.recaptchaWidgetId = null;
        
        let errorMessage = 'reCAPTCHA 설정에 실패했습니다.';
        
        if (error.code === 'auth/internal-error') {
          errorMessage = 'Firebase 프로젝트 설정을 확인해주세요. Blaze 플랜과 Phone Authentication 활성화가 필요합니다.';
        } else if (error.message?.includes('site key')) {
          errorMessage = 'reCAPTCHA 사이트 키 설정에 문제가 있습니다. .env.production 파일을 확인하세요.';
        } else if (error.message?.includes('domain')) {
          errorMessage = '현재 도메인이 Firebase에서 승인되지 않았습니다.';
        }
        
        return { success: false, error: errorMessage };
      });

    } catch (error) {
      console.error('❌ reCAPTCHA 설정 실패:', error);
      window.recaptchaVerifier = null;
      window.recaptchaWidgetId = null;
      return Promise.resolve({ success: false, error: error.message });
    }
  },

  // 🚀 출시용 SMS 발송 (안정화)
  sendVerificationCode: async (phoneNumber) => {
    try {
      checkFirebaseServices();
      
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA가 설정되지 않았습니다.');
      }

      debugLog('🚀 출시용 SMS 발송 시작', { phoneNumber });

      console.log('🚀 Firebase 프로젝트 정보:', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain
      });

      // reCAPTCHA 토큰 미리 생성
      console.log('🚀 reCAPTCHA 토큰 생성 시도');
      
      try {
        const token = await window.recaptchaVerifier.verify();
        console.log('✅ reCAPTCHA 토큰 생성 성공');
        
        if (!token) {
          throw new Error('reCAPTCHA 토큰이 생성되지 않았습니다.');
        }
      } catch (tokenError) {
        console.error('❌ reCAPTCHA 토큰 생성 실패:', tokenError);
        return {
          success: false,
          error: 'reCAPTCHA 토큰 생성에 실패했습니다. 다시 시도해주세요.',
        };
      }

      // SMS 발송
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );

      debugLog('✅ 출시용 SMS 발송 성공');

      return {
        success: true,
        confirmationResult,
        verificationId: confirmationResult.verificationId,
      };
    } catch (error) {
      console.error('❌ 출시용 SMS 발송 실패:', error);
      debugLog('SMS 발송 오류', error);

      let errorMessage = 'SMS 인증번호 발송에 실패했습니다.';

      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = '올바른 휴대폰 번호를 입력해주세요.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Phone Authentication이 Firebase Console에서 활성화되지 않았습니다.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = '보안 인증에 실패했습니다. reCAPTCHA를 다시 완료해주세요.';
          break;
        case 'auth/quota-exceeded':
          errorMessage = 'SMS 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'auth/missing-app-credential':
          errorMessage = 'Firebase 앱 설정에 문제가 있습니다. 관리자에게 문의하세요.';
          break;
        case 'auth/app-not-authorized':
          errorMessage = '현재 도메인이 Firebase에서 승인되지 않았습니다.';
          break;
        case 'auth/internal-error-encountered':
          errorMessage = 'Firebase 내부 오류가 발생했습니다. Blaze 플랜으로 업그레이드가 필요할 수 있습니다.';
          break;
        default:
          if (error.message?.includes('reCAPTCHA')) {
            errorMessage = 'reCAPTCHA 인증이 필요합니다. 보안 확인을 완료해주세요.';
          } else if (error.message?.includes('billing') || error.message?.includes('Blaze')) {
            errorMessage = 'Firebase 프로젝트를 Blaze 플랜으로 업그레이드해야 SMS 인증을 사용할 수 있습니다.';
          }
          break;
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code,
      };
    }
  },

  // reCAPTCHA 정리
  cleanupRecaptcha: () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        console.log('✅ reCAPTCHA 정리 완료');
      } catch (error) {
        console.warn('⚠️ reCAPTCHA 정리 중 오류:', error);
      }
      window.recaptchaVerifier = null;
    }
    
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = '';
    }
  },
};

// 🚀 출시용 인증 서비스 (안정화)
export const authService = {
  phone: phoneAuthService,

  init: () => {
    phoneAuthService.init();
    console.log('🚀 출시용 AuthService 초기화 완료');
  },

  // 🚀 출시용 회원가입 (동일 번호 가입 방지 강화)
  signUpWithEmail: async (email, password, displayName, phoneNumber = null) => {
    try {
      checkFirebaseServices();
      debugLog('🚀 출시용 회원가입 시작', { email, displayName, phoneNumber });

      // 🚀 1단계: 휴대폰 번호 중복 체크 (회원가입 전)
      if (phoneNumber) {
        const formattedPhone = phoneNumber.replace(/[-\s]/g, '').startsWith('0') 
          ? '+82' + phoneNumber.replace(/[-\s]/g, '').slice(1)
          : phoneNumber;
        
        debugLog('🚀 휴대폰 번호 중복 체크', { formattedPhone });
        
        try {
          const usersRef = collection(db, 'users');
          const q = query(
            usersRef, 
            where('phoneNumber', '==', formattedPhone),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const existingUser = querySnapshot.docs[0].data();
            console.log('⚠️ 중복된 휴대폰 번호 발견:', existingUser.email);
            
            return {
              success: false,
              error: `이미 ${existingUser.email} 계정에서 사용 중인 휴대폰 번호입니다. 다른 번호를 사용하거나 기존 계정으로 로그인해주세요.`,
            };
          }
          
          console.log('✅ 휴대폰 번호 사용 가능');
        } catch (phoneCheckError) {
          console.error('❌ 휴대폰 번호 중복 체크 실패:', phoneCheckError);
          return {
            success: false,
            error: '휴대폰 번호 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.',
          };
        }
      }

      // 2단계: Firebase Auth 사용자 생성
      debugLog('🚀 Firebase Auth 사용자 생성');
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      debugLog('✅ Firebase Auth 사용자 생성 성공', { uid: user.uid });

      // 3단계: 이메일 인증 발송
      try {
        debugLog('🚀 이메일 인증 발송');
        await sendEmailVerification(user, {
          url: window.location.origin + '/dashboard',
          handleCodeInApp: false,
        });
        debugLog('✅ 이메일 인증 발송 성공');
      } catch (verificationError) {
        console.warn('⚠️ 이메일 인증 발송 실패:', verificationError);
      }

      // 4단계: 사용자 프로필 업데이트
      try {
        await updateProfile(user, {
          displayName: displayName,
        });
        debugLog('✅ 프로필 업데이트 완료');
      } catch (profileError) {
        console.warn('⚠️ 프로필 업데이트 실패:', profileError);
      }

      // 5단계: Firestore에 사용자 정보 저장
      const userDocData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user',
        emailVerified: false,
        phoneNumber: phoneNumber || null,
        phoneVerified: !!phoneNumber,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        analysisCount: 0,
        preferences: {
          defaultFramework: 'KISA',
          notifications: true,
          theme: 'light',
        },
        provider: 'email',
      };

      debugLog('🚀 Firestore에 사용자 정보 저장', userDocData);

      try {
        await setDoc(doc(db, 'users', user.uid), userDocData);
        debugLog('✅ Firestore 저장 성공');
      } catch (firestoreError) {
        console.error('❌ Firestore 저장 실패:', firestoreError);
        
        // Firestore 저장 실패 시 생성된 Auth 사용자 삭제
        try {
          await user.delete();
          debugLog('✅ Auth 사용자 정리 완료');
        } catch (deleteError) {
          console.error('❌ Auth 사용자 정리 실패:', deleteError);
        }
        
        return {
          success: false,
          error: '사용자 정보 저장에 실패했습니다. 다시 시도해주세요.',
        };
      }

      debugLog('🚀 출시용 회원가입 완료!');

      return {
        success: true,
        requiresEmailVerification: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: 'user',
          emailVerified: false,
          phoneNumber: phoneNumber,
          phoneVerified: !!phoneNumber,
        },
      };
    } catch (error) {
      console.error('❌ 출시용 회원가입 실패:', error);
      debugLog('회원가입 에러 상세', error);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 가입된 이메일 주소입니다. 로그인을 시도해보세요.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 9자 이상의 영문, 숫자, 특수문자를 조합해주세요.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바르지 않은 이메일 주소입니다.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = '이메일/비밀번호 가입이 비활성화되어 있습니다. 관리자에게 문의하세요.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        originalError: error,
      };
    }
  },

  // 기존 다른 메서드들은 그대로 유지 (signInWithEmail, signInWithGoogle 등)
  signInWithEmail: async (email, password) => {
    try {
      checkFirebaseServices();
      debugLog('이메일 로그인 시작', { email });

      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      debugLog('사용자 로그인 성공', { uid: user.uid });

      // Firestore에서 사용자 추가 정보 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      debugLog('Firestore에서 사용자 데이터 조회');

      let userData = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
        debugLog('Firestore 사용자 데이터 발견', userData);

        // 마지막 로그인 시간 업데이트
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });
      } else {
        debugLog('Firestore에 사용자 데이터 없음, 새 문서 생성');
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '사용자',
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          analysisCount: 0,
          preferences: {
            defaultFramework: 'KISA',
            notifications: true,
            theme: 'light',
          },
        };

        await setDoc(userDocRef, userData);
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userData.displayName || '사용자',
          role: userData.role || 'user',
          analysisCount: userData.analysisCount || 0,
          preferences: userData.preferences || {},
        },
      };
    } catch (error) {
      console.error('로그인 실패:', error);
      debugLog('로그인 에러 상세', error);

      return {
        success: false,
        error: getErrorMessage(error.code),
        originalError: error,
      };
    }
  },

  signInWithGoogle: async () => {
    try {
      checkFirebaseServices();
      debugLog('Google 로그인 시작');

      const popup = window.open('', '', 'width=1,height=1');
      if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        throw new Error('popup-blocked');
      }
      popup.close();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      debugLog('Google 로그인 성공', { uid: user.uid });

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData = {};
      if (!userDoc.exists()) {
        debugLog('새 Google 사용자, Firestore 문서 생성');
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          analysisCount: 0,
          preferences: {
            defaultFramework: 'KISA',
            notifications: true,
            theme: 'light',
          },
          provider: 'google',
        };

        await setDoc(userDocRef, userData);
      } else {
        debugLog('기존 Google 사용자, 마지막 로그인 업데이트');
        userData = userDoc.data();
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
          photoURL: user.photoURL,
        });
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userData.role || 'user',
          analysisCount: userData.analysisCount || 0,
          preferences: userData.preferences || {},
        },
      };
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      debugLog('Google 로그인 에러 상세', error);

      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: '로그인 창이 닫혔습니다. 다시 시도해주세요.',
        };
      }

      if (error.message === 'popup-blocked') {
        return {
          success: false,
          error: '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.',
        };
      }

      return {
        success: false,
        error: getErrorMessage(error.code),
        originalError: error,
      };
    }
  },

  signOut: async () => {
    try {
      checkFirebaseServices();
      debugLog('로그아웃 시작');
      await signOut(auth);
      debugLog('로그아웃 성공');
      return { success: true };
    } catch (error) {
      console.error('로그아웃 실패:', error);
      debugLog('로그아웃 에러 상세', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  resetPassword: async email => {
    try {
      checkFirebaseServices();
      debugLog('비밀번호 재설정 시작', { email });
      await sendPasswordResetEmail(auth, email);
      debugLog('비밀번호 재설정 이메일 발송');
      return { success: true };
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
      debugLog('비밀번호 재설정 에러 상세', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  onAuthStateChanged: callback => {
    try {
      checkFirebaseServices();
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Auth state listener 오류:', error);
      return () => {};
    }
  },

  resendEmailVerification: async () => {
    try {
      checkFirebaseServices();
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: '로그인이 필요합니다.',
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          error: '이미 이메일 인증이 완료되었습니다.',
        };
      }

      debugLog('이메일 인증 재발송');
      await sendEmailVerification(user, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: false,
      });

      debugLog('이메일 인증 재발송 성공');

      return {
        success: true,
        message: '인증 이메일이 재발송되었습니다.',
      };
    } catch (error) {
      console.error('이메일 인증 재발송 실패:', error);
      debugLog('이메일 인증 재발송 에러', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  refreshEmailVerification: async () => {
    try {
      checkFirebaseServices();
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: '로그인이 필요합니다.',
        };
      }

      debugLog('이메일 인증 상태 새로고침');
      await user.reload();

      debugLog('이메일 인증 상태 새로고침 완료', { emailVerified: user.emailVerified });

      return {
        success: true,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      console.error('이메일 인증 상태 새로고침 실패:', error);
      debugLog('이메일 인증 상태 새로고침 에러', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  testConnection: async () => {
    try {
      debugLog('Firebase 연결 테스트');

      if (!auth || !db) {
        return {
          success: false,
          connected: false,
          error: 'Firebase 서비스가 초기화되지 않음',
          details: {
            auth: !!auth,
            firestore: !!db,
          },
        };
      }

      const authTest = auth.currentUser !== undefined;
      debugLog('Auth 연결 테스트', { success: authTest });

      let firestoreTest = false;
      try {
        firestoreTest = db.app !== undefined;
        debugLog('Firestore 연결 테스트', { success: firestoreTest });
      } catch (firestoreError) {
        console.warn('Firestore 연결 테스트 실패:', firestoreError);
        debugLog('Firestore 연결 실패', firestoreError);
      }

      const overallSuccess = authTest && firestoreTest;
      debugLog('전체 Firebase 연결 테스트', { success: overallSuccess });

      return {
        success: true,
        connected: overallSuccess,
        details: {
          auth: authTest,
          firestore: firestoreTest,
        },
      };
    } catch (error) {
      console.error('Firebase 연결 테스트 실패:', error);
      debugLog('Firebase 연결 테스트 실패', error);
      return {
        success: false,
        connected: false,
        error: error.message,
      };
    }
  },

  // 기타 필요한 메서드들 (incrementAnalysisCount, saveAnalysisResult 등)은 
  // 기존 코드를 그대로 유지하거나 필요시 추가
};

// Firebase 에러 메시지 한국어 변환
const getErrorMessage = errorCode => {
  const errorMessages = {
    'auth/user-disabled': '계정이 비활성화되었습니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 9자 이상의 영문, 숫자, 특수문자를 조합해주세요.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/invalid-credential': '잘못된 인증 정보입니다.',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/operation-not-allowed': '이 인증 방법은 허용되지 않습니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    'auth/popup-closed-by-user': '로그인 창이 사용자에 의해 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인 요청이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
    'auth/unauthorized-domain': '이 도메인은 Firebase 인증에 허가되지 않았습니다.',
    'auth/account-exists-with-different-credential': '다른 인증 방법으로 가입된 계정입니다.',
    'auth/credential-already-in-use': '이미 사용 중인 인증 정보입니다.',
    'auth/invalid-phone-number': '올바른 휴대폰 번호 형식이 아닙니다.',
    'auth/missing-phone-number': '휴대폰 번호를 입력해주세요.',
    'auth/quota-exceeded': 'SMS 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    'auth/captcha-check-failed': '보안 인증에 실패했습니다. 다시 시도해주세요.',
    'auth/invalid-verification-code': '인증번호가 올바르지 않습니다.',
    'auth/invalid-verification-id': '잘못된 인증 세션입니다.',
    'auth/missing-verification-code': '인증번호를 입력해주세요.',
    'auth/missing-verification-id': '인증 세션이 없습니다.',
    'auth/code-expired': '인증번호가 만료되었습니다. 다시 받아주세요.',
    'auth/session-expired': '인증 세션이 만료되었습니다. 처음부터 다시 시도해주세요.',
    'auth/app-not-authorized': '앱이 이 작업에 대해 승인되지 않았습니다.',
    'auth/missing-app-credential': 'Firebase 앱 인증 정보가 누락되었습니다.',
    'auth/invalid-app-credential': 'Firebase 앱 인증 정보가 올바르지 않습니다.',
    'auth/timeout': '요청 시간이 초과되었습니다.',
    'auth/missing-password': '비밀번호를 입력해주세요.',
    'auth/internal-error': '내부 오류가 발생했습니다. 다시 시도해주세요.',
    'auth/invalid-api-key': 'Firebase API 키가 올바르지 않습니다.',
    'auth/app-deleted': 'Firebase 앱이 삭제되었습니다.',
    'auth/expired-action-code': '만료된 인증 코드입니다.',
    'auth/invalid-action-code': '올바르지 않은 인증 코드입니다.',
    'firestore/permission-denied': 'Firestore 접근 권한이 없습니다. 로그인 상태를 확인해주세요.',
    'firestore/unavailable': 'Firestore 서비스를 사용할 수 없습니다.',
    'firestore/deadline-exceeded': 'Firestore 요청 시간이 초과되었습니다.',
    'firestore/unauthenticated': '인증이 필요합니다. 다시 로그인해주세요.',
  };

  return errorMessages[errorCode] || `인증 오류가 발생했습니다: ${errorCode}`;
};

export default app || null;
