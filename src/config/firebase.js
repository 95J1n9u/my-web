// Firebase 9.x SDK (모듈형) 사용
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
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyBz7XX1dbo7UU14AD4jJ1-2EFwxOWoP1bU',
  authDomain: 'net-30335.firebaseapp.com',
  projectId: 'net-30335',
  storageBucket: 'net-30335.firebasestorage.app',
  messagingSenderId: '44418901752',
  appId: '1:44418901752:web:f246bd4d454b15c9a6bd0d',
  measurementId: 'G-05KS19EF7J',
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스들
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 인증 관련 서비스 함수들
export const authService = {
  // 이메일/비밀번호 회원가입
  signUpWithEmail: async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      // 사용자 프로필 업데이트
      await updateProfile(user, {
        displayName: displayName,
      });

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user', // 기본 역할
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        analysisCount: 0,
        preferences: {
          defaultFramework: 'KISA',
          notifications: true,
          theme: 'light',
        },
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: 'user',
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 이메일/비밀번호 로그인
  signInWithEmail: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 마지막 로그인 시간 업데이트
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
      });

      // Firestore에서 사용자 추가 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

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
      console.error('Sign in error:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // Google 로그인
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Firestore에서 기존 사용자 확인
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // 새 사용자인 경우 Firestore에 정보 저장
        await setDoc(doc(db, 'users', user.uid), {
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
        });
      } else {
        // 기존 사용자의 마지막 로그인 시간 업데이트
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        });
      }

      const userData = userDoc.exists() ? userDoc.data() : {};

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
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 로그아웃
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 비밀번호 재설정
  resetPassword: async email => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 인증 상태 변화 감지
  onAuthStateChanged: callback => {
    return onAuthStateChanged(auth, callback);
  },

  // 사용자 분석 횟수 증가
  incrementAnalysisCount: async uid => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentCount = userDoc.data().analysisCount || 0;
        await updateDoc(userRef, {
          analysisCount: currentCount + 1,
          lastAnalysisAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error incrementing analysis count:', error);
    }
  },

  // 사용자 설정 업데이트
  updateUserPreferences: async (uid, preferences) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        preferences: preferences,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },
};

// Firebase 에러 메시지 한국어 변환
const getErrorMessage = errorCode => {
  const errorMessages = {
    'auth/user-disabled': '계정이 비활성화되었습니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/invalid-credential': '잘못된 인증 정보입니다.',
    'auth/too-many-requests':
      '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/popup-closed-by-user': '로그인 창이 사용자에 의해 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인 요청이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
    'auth/operation-not-allowed': '이 인증 방법은 허용되지 않습니다.',
    'auth/account-exists-with-different-credential':
      '다른 인증 방법으로 가입된 계정입니다.',
    'auth/credential-already-in-use': '이미 사용 중인 인증 정보입니다.',
    'auth/timeout': '요청 시간이 초과되었습니다.',
    'auth/missing-password': '비밀번호를 입력해주세요.',
    'auth/internal-error': '내부 오류가 발생했습니다. 다시 시도해주세요.',
  };

  return errorMessages[errorCode] || '로그인 중 오류가 발생했습니다.';
};

export default app;
