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
  sendEmailVerification,
  connectAuthEmulator,
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

// 🔥 App Check import (선택적 사용)
import { getAppCheck, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

console.log('firebase.js loaded');

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
  
  // 🔥 App Check 설정 (선택적, 프로덕션 환경에서만)
  try {
    if (process.env.NODE_ENV === 'production') {
      const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
      
      if (siteKey && !siteKey.includes('placeholder')) {
        console.log('🔥 프로덕션 환경: App Check 초기화 시도');
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true
        });
        console.log('✅ App Check 초기화 성공');
      } else {
        console.warn('⚠️ 프로덕션 환경에서 reCAPTCHA 사이트 키 없음 - App Check 비활성화');
        appCheck = null;
      }
    } else {
      console.log('🔥 개발 환경: App Check 비활성화');
      appCheck = null;
    }
  } catch (appCheckError) {
    console.warn('App Check 초기화 실패:', appCheckError.message || appCheckError);
    appCheck = null;
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  // 🔥 한국어 설정
  auth.languageCode = 'ko';
  
  console.log('📋 Firebase 초기화 상태:');
  console.log('- App:', !!app);
  console.log('- Auth:', !!auth);
  console.log('- Firestore:', !!db);
  console.log('- App Check:', !!appCheck, appCheck ? '(활성화됨)' : '(비활성화됨)');
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
    console.log('✅ Firebase 에뮬레이터 연결 완료');
  } catch (error) {
    console.log('ℹ️ Firebase 에뮬레이터 연결 실패 (정상적인 경우입니다):', error.message);
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

// 인증 관련 서비스 함수들
export const authService = {
  // 🔥 Firebase 서비스 초기화
  init: () => {
    console.log('🔥 AuthService 초기화 완료 (SMS 인증 제거됨)');
  },

  // 이메일 인증 재발송
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

      debugLog('Resending email verification');
      await sendEmailVerification(user, {
        url: window.location.origin + '/dashboard',
        handleCodeInApp: false,
      });

      debugLog('Email verification resent successfully');

      return {
        success: true,
        message: '인증 이메일이 재발송되었습니다.',
      };
    } catch (error) {
      console.error('Email verification resend error:', error);
      debugLog('Email verification resend error', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 이메일 인증 상태 새로고침
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

      debugLog('Refreshing email verification status');
      await user.reload(); // Firebase에서 최신 상태 가져오기

      debugLog('Email verification status refreshed', { emailVerified: user.emailVerified });

      return {
        success: true,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      console.error('Email verification refresh error:', error);
      debugLog('Email verification refresh error', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 사용자 권한 변경 (관리자만 가능)
  updateUserRole: async (adminUid, targetUid, newRole) => {
    try {
      checkFirebaseServices();
      debugLog('Updating user role', { adminUid, targetUid, newRole });

      // 관리자 권한 확인
      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      // 대상 사용자 권한 변경
      const targetRef = doc(db, 'users', targetUid);
      await updateDoc(targetRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
        updatedBy: adminUid,
      });

      debugLog('User role updated successfully');

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      debugLog('User role update error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 모든 사용자 목록 조회 (관리자만 가능)
  getAllUsers: async (adminUid, limitCount = 50) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching all users', { adminUid, limitCount });

      // 관리자 권한 확인
      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
          users: [],
        };
      }

      // 모든 사용자 조회
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          uid: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role || 'user',
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
          analysisCount: userData.analysisCount || 0,
          photoURL: userData.photoURL,
          provider: userData.provider,
        });
      });

      debugLog('Users fetched successfully', { count: users.length });

      return {
        success: true,
        users: users,
        count: users.length,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      debugLog('Users fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        users: [],
      };
    }
  },

  // 시스템 통계 조회 (관리자만 가능)
  getSystemStats: async adminUid => {
    try {
      checkFirebaseServices();
      debugLog('Fetching system stats', { adminUid });

      // 관리자 권한 확인
      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      // 통계 데이터 수집
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const stats = {
        totalUsers: 0,
        usersByRole: {
          user: 0,
          admin: 0,
          moderator: 0,
        },
        totalAnalyses: 0,
        usersByProvider: {
          email: 0,
          google: 0,
        },
        recentSignups: 0, // 최근 7일
        activeUsers: 0, // 최근 30일 로그인
      };

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        stats.totalUsers++;

        // 역할별 통계
        const role = userData.role || 'user';
        if (stats.usersByRole[role] !== undefined) {
          stats.usersByRole[role]++;
        }

        // 분석 횟수 누적
        stats.totalAnalyses += userData.analysisCount || 0;

        // 가입 방법별 통계
        const provider = userData.provider || 'email';
        if (stats.usersByProvider[provider] !== undefined) {
          stats.usersByProvider[provider]++;
        }

        // 최근 가입자
        if (userData.createdAt && userData.createdAt.toDate() > sevenDaysAgo) {
          stats.recentSignups++;
        }

        // 활성 사용자
        if (
          userData.lastLoginAt &&
          userData.lastLoginAt.toDate() > thirtyDaysAgo
        ) {
          stats.activeUsers++;
        }
      });

      debugLog('System stats calculated', stats);

      return {
        success: true,
        stats: stats,
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      debugLog('System stats error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 🔥 signUpWithEmail 함수 수정 - 휴대폰 번호 제거
  signUpWithEmail: async (email, password, displayName) => {
    try {
      checkFirebaseServices();
      debugLog('Starting email signup', { email, displayName });

      // 🔥 1단계: Firebase Auth 사용자 생성
      debugLog('🔥 Firebase Auth 사용자 생성 시작');
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      debugLog('🔥 Firebase Auth 사용자 생성 성공', { uid: user.uid });

      // 🔥 2단계: 이메일 인증 발송
      try {
        debugLog('🔥 이메일 인증 발송');
        await sendEmailVerification(user, {
          url: window.location.origin + '/dashboard',
          handleCodeInApp: false,
        });
        debugLog('Email verification sent successfully');
      } catch (verificationError) {
        console.warn('Failed to send verification email:', verificationError);
      }

      // 🔥 3단계: 사용자 프로필 업데이트
      try {
        await updateProfile(user, {
          displayName: displayName,
        });
        debugLog('Profile updated');
      } catch (profileError) {
        console.warn('Failed to update profile:', profileError);
      }

      // 🔥 4단계: Firestore에 사용자 정보 저장 (이제 인증된 상태)
      const userDocData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user',
        emailVerified: false,
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

      debugLog('🔥 Firestore에 사용자 정보 저장', userDocData);

      try {
        await setDoc(doc(db, 'users', user.uid), userDocData);
        debugLog('User saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Failed to save user to Firestore:', firestoreError);
        
        // Firestore 저장 실패 시 생성된 Auth 사용자 삭제
        try {
          await user.delete();
          debugLog('Cleaned up Auth user after Firestore failure');
        } catch (deleteError) {
          console.error('Failed to cleanup Auth user:', deleteError);
        }
        
        return {
          success: false,
          error: '사용자 정보 저장에 실패했습니다. 다시 시도해주세요.',
        };
      }

      debugLog('🔥 회원가입 완료!');

      return {
        success: true,
        requiresEmailVerification: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: 'user',
          emailVerified: false,
        },
      };
    } catch (error) {
      console.error('🔥 회원가입 전체 프로세스 실패:', error);
      debugLog('Signup error details', error);

      // 구체적인 에러 메시지 제공
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

  // 이메일/비밀번호 로그인
  signInWithEmail: async (email, password) => {
    try {
      checkFirebaseServices();
      debugLog('Starting email signin', { email });

      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      debugLog('User signed in successfully', { uid: user.uid });

      // Firestore에서 사용자 추가 정보 가져오기
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      debugLog('Fetching user data from Firestore');

      let userData = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
        debugLog('User data found in Firestore', userData);

        // 마지막 로그인 시간 업데이트
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        });
      } else {
        debugLog('User data not found in Firestore, creating new document');
        // 기존 사용자인데 Firestore에 데이터가 없는 경우 생성
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
      console.error('Sign in error:', error);
      debugLog('Signin error details', error);

      return {
        success: false,
        error: getErrorMessage(error.code),
        originalError: error,
      };
    }
  },
  
  createPost: async (uid, postData) => {
    try {
      checkFirebaseServices();
      debugLog('Creating post', { uid, postData });

      const postDoc = {
        title: postData.title,
        content: postData.content,
        category: postData.category || 'general',
        authorId: uid,
        authorName: postData.authorName,
        authorEmail: postData.authorEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0,
        comments: 0,
        isPublished: true,
        tags: postData.tags || [],
      };

      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, postDoc);

      debugLog('Post created successfully', { docId: docRef.id });

      return {
        success: true,
        postId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      debugLog('Post creation error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 공지사항 작성 (관리자 전용)
  createNotice: async (adminUid, noticeData) => {
    try {
      checkFirebaseServices();
      debugLog('Creating notice', { adminUid, noticeData });

      // 관리자 권한 확인
      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      const noticeDoc = {
        title: noticeData.title,
        content: noticeData.content,
        category: noticeData.category || 'general',
        priority: noticeData.priority || 'normal',
        authorId: adminUid,
        authorName: noticeData.authorName,
        authorEmail: noticeData.authorEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        isPublished: true,
        isPinned: noticeData.isPinned || false,
        expiresAt: noticeData.expiresAt || null,
      };

      const noticesRef = collection(db, 'notices');
      const docRef = await addDoc(noticesRef, noticeDoc);

      debugLog('Notice created successfully', { docId: docRef.id });

      return {
        success: true,
        noticeId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating notice:', error);
      debugLog('Notice creation error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 게시글 목록 조회
  getPosts: async (limitCount = 20, category = null) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching posts', { limitCount, category });

      const postsRef = collection(db, 'posts');
      const q = query(postsRef, limit(100));

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const isPublished = data.isPublished === true;
        const matchesCategory =
          !category || category === 'all' || data.category === category;

        if (isPublished && matchesCategory) {
          posts.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // 클라이언트에서 정렬 및 제한
      posts.sort((a, b) => {
        const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return bDate - aDate;
      });

      const limitedPosts = posts.slice(0, limitCount);

      return {
        success: true,
        posts: limitedPosts,
        count: limitedPosts.length,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return {
        success: false,
        error: error.message,
        posts: [],
      };
    }
  },

  // 공지사항 목록 조회
  getNotices: async (limitCount = 10) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching notices', { limitCount });

      const noticesRef = collection(db, 'notices');
      const q = query(
        noticesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2)
      );

      const querySnapshot = await getDocs(q);
      const notices = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.isPublished === true) {
          notices.push({
            id: doc.id,
            ...data,
          });
        }
      });

      const limitedNotices = notices.slice(0, limitCount);

      limitedNotices.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return bDate - aDate;
      });

      debugLog('Notices fetched successfully', {
        count: limitedNotices.length,
      });

      return {
        success: true,
        notices: limitedNotices,
        count: limitedNotices.length,
      };
    } catch (error) {
      console.error('Error fetching notices:', error);
      debugLog('Notices fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        notices: [],
      };
    }
  },

  // 게시글 수정
  updatePost: async (postId, authorId, updateData) => {
    try {
      checkFirebaseServices();
      debugLog('Updating post', { postId, authorId, updateData });

      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        return {
          success: false,
          error: '게시글을 찾을 수 없습니다.',
        };
      }

      if (postDoc.data().authorId !== authorId) {
        return {
          success: false,
          error: '게시글을 수정할 권한이 없습니다.',
        };
      }

      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(postRef, updatePayload);

      debugLog('Post updated successfully');

      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      debugLog('Post update error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 게시글 삭제
  deletePost: async (postId, authorId) => {
    try {
      checkFirebaseServices();
      debugLog('Deleting post', { postId, authorId });

      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        return {
          success: false,
          error: '게시글을 찾을 수 없습니다.',
        };
      }

      if (postDoc.data().authorId !== authorId) {
        return {
          success: false,
          error: '게시글을 삭제할 권한이 없습니다.',
        };
      }

      await deleteDoc(postRef);

      debugLog('Post deleted successfully');

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      debugLog('Post delete error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 게시글 상세 조회 및 조회수 증가
  getPost: async postId => {
    try {
      checkFirebaseServices();
      debugLog('Fetching post', { postId });

      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        return {
          success: false,
          error: '게시글을 찾을 수 없습니다.',
        };
      }

      try {
        await updateDoc(postRef, {
          views: increment(1),
        });
      } catch (e) {
        console.warn('Failed to increment post views:', e);
      }

      const postData = {
        id: postDoc.id,
        ...postDoc.data(),
        views: (postDoc.data().views || 0) + 1,
      };

      debugLog('Post fetched successfully', { postId: postData.id });

      return {
        success: true,
        post: postData,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      debugLog('Post fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 댓글 작성 (알림 기능 포함)
  createComment: async (postId, uid, commentData) => {
    try {
      checkFirebaseServices();
      debugLog('Creating comment', { postId, uid, commentData });

      // 먼저 게시글 정보 조회 (작성자 확인용)
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        return {
          success: false,
          error: '게시글을 찾을 수 없습니다.',
        };
      }

      const postData = postDoc.data();
      
      const commentDoc = {
        content: commentData.content,
        authorId: uid,
        authorName: commentData.authorName,
        createdAt: serverTimestamp(),
      };

      const commentsRef = collection(db, 'posts', postId, 'comments');
      const docRef = await addDoc(commentsRef, commentDoc);

      // 댓글 수 증가
      try {
        await updateDoc(postRef, { comments: increment(1) });
      } catch (e) {
        console.warn('Failed to increment comment count:', e);
      }

      // 🔥 게시글 작성자에게 알림 생성 (자신의 글에 자신이 댓글 단 경우 제외)
      if (postData.authorId && postData.authorId !== uid) {
        try {
          await authService.createNotification(postData.authorId, 'comment', {
            postId: postId,
            postTitle: postData.title,
            commentAuthor: commentData.authorName,
            message: `${commentData.authorName}님이 회원님의 게시글에 댓글을 남겼습니다.`,
          });
          debugLog('Comment notification created for post author');
        } catch (notificationError) {
          console.warn('Failed to create comment notification:', notificationError);
        }
      }

      debugLog('Comment created successfully', { commentId: docRef.id });

      return { success: true, commentId: docRef.id };
    } catch (error) {
      console.error('Error creating comment:', error);
      debugLog('Comment creation error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 🔥 알림 관련 함수들 추가
  
  // 알림 생성
  createNotification: async (recipientId, type, data) => {
    try {
      checkFirebaseServices();
      debugLog('Creating notification', { recipientId, type, data });

      const notificationDoc = {
        recipientId: recipientId,
        type: type, // 'comment', 'like', 'post_reply' 등
        data: {
          postId: data.postId || null,
          postTitle: data.postTitle ? data.postTitle.substring(0, 100) : null,
          commentAuthor: data.commentAuthor ? data.commentAuthor.substring(0, 50) : null,
          message: data.message ? data.message.substring(0, 200) : null,
        },
        isRead: false,
        createdAt: serverTimestamp(),
      };

      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, notificationDoc);

      debugLog('Notification created successfully', { notificationId: docRef.id });

      return {
        success: true,
        notificationId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      debugLog('Notification creation error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 사용자의 알림 목록 조회
  getUserNotifications: async (uid, limitCount = 20) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching user notifications', { uid, limitCount });

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications = [];

      querySnapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      debugLog('User notifications fetched successfully', {
        count: notifications.length,
      });

      return {
        success: true,
        notifications: notifications,
        count: notifications.length,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      debugLog('Notifications fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        notifications: [],
      };
    }
  },

  // 읽지 않은 알림 개수 조회
  getUnreadNotificationCount: async (uid) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching unread notification count', { uid });

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', uid),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const unreadCount = querySnapshot.size;

      debugLog('Unread notification count fetched', { count: unreadCount });

      return {
        success: true,
        count: unreadCount,
      };
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      debugLog('Unread notification count error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        count: 0,
      };
    }
  },

  // 알림을 읽음 처리
  markNotificationAsRead: async (notificationId, uid) => {
    try {
      checkFirebaseServices();
      debugLog('Marking notification as read', { notificationId, uid });

      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDoc(notificationRef);

      if (!notificationDoc.exists()) {
        return {
          success: false,
          error: '알림을 찾을 수 없습니다.',
        };
      }

      // 알림 수신자 확인
      if (notificationDoc.data().recipientId !== uid) {
        return {
          success: false,
          error: '알림을 읽을 권한이 없습니다.',
        };
      }

      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });

      debugLog('Notification marked as read successfully');

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      debugLog('Mark notification as read error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 모든 알림을 읽음 처리
  markAllNotificationsAsRead: async (uid) => {
    try {
      checkFirebaseServices();
      debugLog('Marking all notifications as read', { uid });

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', uid),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = [];

      querySnapshot.forEach(doc => {
        batch.push(
          updateDoc(doc.ref, {
            isRead: true,
            readAt: serverTimestamp(),
          })
        );
      });

      await Promise.all(batch);

      debugLog('All notifications marked as read successfully', {
        count: batch.length,
      });

      return {
        success: true,
        updatedCount: batch.length,
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      debugLog('Mark all notifications as read error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 댓글 목록 조회
  getComments: async (postId, limitCount = 50) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching comments', { postId, limitCount });

      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(
        commentsRef,
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const comments = [];

      snapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });

      debugLog('Comments fetched', { count: comments.length });

      return { success: true, comments };
    } catch (error) {
      console.error('Error fetching comments:', error);
      debugLog('Comments fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        comments: [],
      };
    }
  },

  // 댓글 삭제
  deleteComment: async (postId, commentId) => {
    try {
      checkFirebaseServices();
      debugLog('Deleting comment', { postId, commentId });

      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentRef);

      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, { comments: increment(-1) });
      } catch (e) {
        console.warn('Failed to decrement comment count:', e);
      }

      debugLog('Comment deleted');

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      debugLog('Comment delete error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 공지사항 상세 조회 및 조회수 증가
  getNotice: async noticeId => {
    try {
      checkFirebaseServices();
      debugLog('Fetching notice', { noticeId });

      const noticeRef = doc(db, 'notices', noticeId);
      const noticeDoc = await getDoc(noticeRef);

      if (!noticeDoc.exists()) {
        return {
          success: false,
          error: '공지사항을 찾을 수 없습니다.',
        };
      }

      try {
        await updateDoc(noticeRef, {
          views: increment(1),
        });
      } catch (e) {
        console.warn('Failed to increment notice views:', e);
      }

      const noticeData = {
        id: noticeDoc.id,
        ...noticeDoc.data(),
        views: (noticeDoc.data().views || 0) + 1,
      };

      debugLog('Notice fetched successfully', { noticeId: noticeData.id });

      return {
        success: true,
        notice: noticeData,
      };
    } catch (error) {
      console.error('Error fetching notice:', error);
      debugLog('Notice fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 공지사항 삭제 (관리자 전용)
  deleteNotice: async (noticeId, adminUid) => {
    try {
      checkFirebaseServices();
      debugLog('Deleting notice', { noticeId, adminUid });

      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      const noticeRef = doc(db, 'notices', noticeId);
      const noticeDoc = await getDoc(noticeRef);

      if (!noticeDoc.exists()) {
        return {
          success: false,
          error: '공지사항을 찾을 수 없습니다.',
        };
      }

      await deleteDoc(noticeRef);

      debugLog('Notice deleted successfully');

      return { success: true };
    } catch (error) {
      console.error('Error deleting notice:', error);
      debugLog('Notice delete error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 공지사항 수정 (관리자 전용)
  updateNotice: async (noticeId, adminUid, updateData) => {
    try {
      checkFirebaseServices();
      debugLog('Updating notice', { noticeId, adminUid, updateData });

      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      const noticeRef = doc(db, 'notices', noticeId);
      const noticeDoc = await getDoc(noticeRef);

      if (!noticeDoc.exists()) {
        return {
          success: false,
          error: '공지사항을 찾을 수 없습니다.',
        };
      }

      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(noticeRef, updatePayload);

      debugLog('Notice updated successfully');

      return { success: true };
    } catch (error) {
      console.error('Error updating notice:', error);
      debugLog('Notice update error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // Google 로그인
  signInWithGoogle: async () => {
    try {
      checkFirebaseServices();
      debugLog('Starting Google signin');

      // 팝업 차단 확인
      const popup = window.open('', '', 'width=1,height=1');
      if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        throw new Error('popup-blocked');
      }
      popup.close();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      debugLog('Google signin successful', { uid: user.uid });

      // Firestore에서 기존 사용자 확인
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData = {};
      if (!userDoc.exists()) {
        debugLog('New Google user, creating Firestore document');
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
        debugLog('Existing Google user, updating last login');
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
      console.error('Google sign in error:', error);
      debugLog('Google signin error details', error);

      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: '로그인 창이 닫혔습니다. 다시 시도해주세요.',
        };
      }

      if (error.message === 'popup-blocked') {
        return {
          success: false,
          error:
            '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.',
        };
      }

      return {
        success: false,
        error: getErrorMessage(error.code),
        originalError: error,
      };
    }
  },

  // 로그아웃
  signOut: async () => {
    try {
      checkFirebaseServices();
      debugLog('Starting signout');
      await signOut(auth);
      debugLog('Signout successful');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      debugLog('Signout error details', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 비밀번호 재설정
  resetPassword: async email => {
    try {
      checkFirebaseServices();
      debugLog('Starting password reset', { email });
      await sendPasswordResetEmail(auth, email);
      debugLog('Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      debugLog('Password reset error details', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 인증 상태 변화 감지
  onAuthStateChanged: callback => {
    try {
      checkFirebaseServices();
      return onAuthStateChanged(auth, callback);
    } catch (error) {
      console.error('Auth state listener error:', error);
      return () => {};
    }
  },

  // 사용자 분석 횟수 증가
  incrementAnalysisCount: async uid => {
    try {
      checkFirebaseServices();
      debugLog('Incrementing analysis count', { uid });
      const userRef = doc(db, 'users', uid);

      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentCount = userDoc.data().analysisCount || 0;
        const newCount = currentCount + 1;

        await updateDoc(userRef, {
          analysisCount: newCount,
          lastAnalysisAt: serverTimestamp(),
        });

        debugLog('Analysis count incremented', {
          oldCount: currentCount,
          newCount: newCount,
        });

        return {
          success: true,
          newCount: newCount,
        };
      } else {
        const initialData = {
          uid: uid,
          analysisCount: 1,
          lastAnalysisAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, initialData);
        debugLog('User document created with analysis count', { count: 1 });

        return {
          success: true,
          newCount: 1,
        };
      }
    } catch (error) {
      console.error('Error incrementing analysis count:', error);
      debugLog('Analysis count increment error', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // 사용자 설정 업데이트
  updateUserPreferences: async (uid, preferences) => {
    try {
      checkFirebaseServices();
      debugLog('Updating user preferences', { uid, preferences });
      await updateDoc(doc(db, 'users', uid), {
        preferences: preferences,
        updatedAt: serverTimestamp(),
      });
      debugLog('User preferences updated');
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      debugLog('Preferences update error', error);
      return {
        success: false,
        error: getErrorMessage(error.code),
      };
    }
  },

  // 분석 결과 저장
  saveAnalysisResult: async (uid, analysisData) => {
    try {
      checkFirebaseServices();
      debugLog('Saving analysis result', { uid, analysisData });

      const sanitizedData = sanitizeAnalysisData(analysisData);
      const dataSize = JSON.stringify(sanitizedData).length;
      
      console.log('Analysis data size:', dataSize, 'bytes');
      
      if (dataSize > 900000) {
        console.warn('Analysis data too large, reducing content...');
        
        if (sanitizedData.vulnerabilities && sanitizedData.vulnerabilities.length > 5) {
          sanitizedData.vulnerabilities = sanitizedData.vulnerabilities.slice(0, 5);
        }
        
        sanitizedData.vulnerabilities = sanitizedData.vulnerabilities.map(vuln => ({
          ...vuln,
          description: vuln.description?.substring(0, 200) || '',
          recommendation: vuln.recommendation?.substring(0, 200) || '',
          matchedText: vuln.matchedText?.substring(0, 100) || ''
        }));
      }

      const analysisDoc = {
        userId: uid,
        timestamp: serverTimestamp(),
        deviceType: sanitizedData.deviceType || 'Unknown',
        framework: sanitizedData.framework || 'Unknown',
        fileName: sanitizedData.fileName || 'Unknown',
        fileSize: Math.min(sanitizedData.fileSize || 0, 52428800),
        isComparison: Boolean(sanitizedData.isComparison),
        comparisonFrameworks: sanitizedData.comparisonFrameworks || null,

        summary: {
          totalChecks: Math.max(0, parseInt(sanitizedData.summary?.totalChecks) || 0),
          vulnerabilities: Math.max(0, parseInt(sanitizedData.summary?.vulnerabilities) || 0),
          highSeverity: Math.max(0, parseInt(sanitizedData.summary?.highSeverity) || 0),
          mediumSeverity: Math.max(0, parseInt(sanitizedData.summary?.mediumSeverity) || 0),
          lowSeverity: Math.max(0, parseInt(sanitizedData.summary?.lowSeverity) || 0),
          passed: Math.max(0, parseInt(sanitizedData.summary?.passed) || 0),
          securityScore: Math.max(0, Math.min(100, parseInt(sanitizedData.summary?.securityScore) || 0)),
        },

        metadata: {
          analysisTime: Math.max(0, parseFloat(sanitizedData.metadata?.analysisTime) || 0),
          engineVersion: (sanitizedData.metadata?.engineVersion || 'Unknown').substring(0, 50),
          totalLines: Math.max(0, parseInt(sanitizedData.metadata?.totalLines) || 0),
          frameworkInfo: sanitizedData.metadata?.frameworkInfo ? {
            name: (sanitizedData.metadata.frameworkInfo.name || '').substring(0, 100),
            version: (sanitizedData.metadata.frameworkInfo.version || '').substring(0, 20)
          } : null,
        },

        vulnerabilities: (sanitizedData.vulnerabilities || [])
          .slice(0, 5)
          .map(vuln => ({
            id: String(vuln.id || ''),
            severity: String(vuln.severity || 'Medium').substring(0, 20),
            type: String(vuln.type || 'Security').substring(0, 50),
            description: String(vuln.description || '').substring(0, 200),
            ruleId: String(vuln.ruleId || '').substring(0, 50),
            framework: String(vuln.framework || '').substring(0, 20),
            line: Math.max(0, parseInt(vuln.line) || 0),
          })),

        createdAt: serverTimestamp(),
      };

      const finalSize = JSON.stringify(analysisDoc).length;
      console.log('Final document size:', finalSize, 'bytes');
      
      if (finalSize > 950000) {
        analysisDoc.vulnerabilities = analysisDoc.vulnerabilities.slice(0, 3);
      }

      const analysesRef = collection(db, 'users', uid, 'analyses');
      const docRef = await addDoc(analysesRef, analysisDoc);

      debugLog('Analysis result saved successfully', { docId: docRef.id });

      return {
        success: true,
        analysisId: docRef.id,
      };
    } catch (error) {
      console.error('Error saving analysis result:', error);
      debugLog('Analysis save error', error);
      
      let errorMessage = 'Unknown error';
      if (error.code === 'permission-denied') {
        errorMessage = '저장 권한이 없습니다. 로그인 상태를 확인해주세요.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = '저장할 데이터 형식이 올바르지 않습니다.';
      } else if (error.message.includes('Document too large')) {
        errorMessage = '분석 결과가 너무 큽니다. 간소화된 버전으로 저장됩니다.';
      } else {
        errorMessage = error.message || '분석 결과 저장에 실패했습니다.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // 사용자의 분석 기록 조회
  getUserAnalyses: async (uid, limitCount = 20) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching user analyses', { uid, limitCount });

      const analysesRef = collection(db, 'users', uid, 'analyses');
      const q = query(
        analysesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const analyses = [];

      querySnapshot.forEach(doc => {
        analyses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      debugLog('User analyses fetched successfully', {
        count: analyses.length,
      });

      return {
        success: true,
        analyses: analyses,
        count: analyses.length,
      };
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      debugLog('Analyses fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        analyses: [],
      };
    }
  },

  // 특정 분석 결과 삭제
  deleteAnalysis: async (uid, analysisId) => {
    try {
      checkFirebaseServices();
      debugLog('Deleting analysis', { uid, analysisId });

      const analysisRef = doc(db, 'users', uid, 'analyses', analysisId);
      await deleteDoc(analysisRef);

      debugLog('Analysis deleted successfully');

      return { success: true };
    } catch (error) {
      console.error('Error deleting analysis:', error);
      debugLog('Analysis delete error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 사용자의 분석 통계 조회
  getUserAnalyticsStats: async uid => {
    try {
      checkFirebaseServices();
      debugLog('Fetching user analytics stats', { uid });

      const analysesRef = collection(db, 'users', uid, 'analyses');
      const querySnapshot = await getDocs(analysesRef);

      const stats = {
        totalAnalyses: 0,
        totalVulnerabilities: 0,
        frameworkUsage: {},
        deviceTypeUsage: {},
        averageSecurityScore: 0,
        lastAnalysisDate: null,
        monthlyAnalyses: 0,
      };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      let totalScore = 0;
      let scoreCount = 0;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        stats.totalAnalyses++;

        stats.totalVulnerabilities += data.summary?.vulnerabilities || 0;

        const framework = data.framework;
        if (framework) {
          stats.frameworkUsage[framework] =
            (stats.frameworkUsage[framework] || 0) + 1;
        }

        const deviceType = data.deviceType;
        if (deviceType) {
          stats.deviceTypeUsage[deviceType] =
            (stats.deviceTypeUsage[deviceType] || 0) + 1;
        }

        if (data.summary?.securityScore) {
          totalScore += data.summary.securityScore;
          scoreCount++;
        }

        if (data.timestamp && data.timestamp.toDate() > thirtyDaysAgo) {
          stats.monthlyAnalyses++;
        }

        if (data.timestamp) {
          const analysisDate = data.timestamp.toDate();
          if (
            !stats.lastAnalysisDate ||
            analysisDate > stats.lastAnalysisDate
          ) {
            stats.lastAnalysisDate = analysisDate;
          }
        }
      });

      if (scoreCount > 0) {
        stats.averageSecurityScore = Math.round(totalScore / scoreCount);
      }

      debugLog('User analytics stats calculated', stats);

      return {
        success: true,
        stats: stats,
      };
    } catch (error) {
      console.error('Error fetching user analytics stats:', error);
      debugLog('Analytics stats fetch error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
        stats: null,
      };
    }
  },

  // AI 조치 방안 사용량 확인
  checkAIUsageLimit: async (uid) => {
    try {
      checkFirebaseServices();
      debugLog('Checking AI usage limit', { uid });

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: '사용자 정보를 찾을 수 없습니다.',
        };
      }

      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];

      const defaultAiUsage = {
        lastUsedDate: null,
        usageCount: 0,
        dailyLimit: 20,
      };

      let aiUsage;
      
      if (userData.aiUsage && typeof userData.aiUsage === 'object' && !Array.isArray(userData.aiUsage)) {
        aiUsage = {
          lastUsedDate: userData.aiUsage.lastUsedDate || null,
          usageCount: typeof userData.aiUsage.usageCount === 'number' ? userData.aiUsage.usageCount : 0,
          dailyLimit: typeof userData.aiUsage.dailyLimit === 'number' ? userData.aiUsage.dailyLimit : 5,
        };
      } else {
        aiUsage = { ...defaultAiUsage };
      }

      if (!aiUsage.lastUsedDate || aiUsage.lastUsedDate !== today) {
        aiUsage.usageCount = 0;
        aiUsage.lastUsedDate = today;
      }

      const isAdmin = userData.role === 'admin';

      debugLog('AI usage check result', {
        usageCount: aiUsage.usageCount,
        dailyLimit: aiUsage.dailyLimit,
        isAdmin: isAdmin,
        today: today,
      });

      return {
        success: true,
        usageCount: aiUsage.usageCount,
        dailyLimit: aiUsage.dailyLimit,
        remainingUsage: isAdmin ? 999 : Math.max(0, aiUsage.dailyLimit - aiUsage.usageCount),
        canUse: isAdmin || aiUsage.usageCount < aiUsage.dailyLimit,
        isAdmin: isAdmin,
        resetDate: today,
      };
    } catch (error) {
      console.error('Error checking AI usage limit:', error);
      debugLog('AI usage check error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // AI 조치 방안 사용량 증가
  incrementAIUsage: async (uid) => {
    try {
      checkFirebaseServices();
      debugLog('Incrementing AI usage', { uid });

      const userRef = doc(db, 'users', uid);
      
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('User document does not exist:', uid);
        return {
          success: false,
          error: '사용자 정보를 찾을 수 없습니다.',
        };
      }

      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];

      if (userData.role === 'admin') {
        debugLog('Admin user - no usage increment');
        return {
          success: true,
          usageCount: 0,
          remainingUsage: 999,
          isAdmin: true,
        };
      }

      const defaultAiUsage = {
        lastUsedDate: null,
        usageCount: 0,
        dailyLimit: 20,
      };

      let currentAiUsage;
      
      if (userData.aiUsage && typeof userData.aiUsage === 'object' && !Array.isArray(userData.aiUsage)) {
        currentAiUsage = {
          lastUsedDate: userData.aiUsage.lastUsedDate || null,
          usageCount: typeof userData.aiUsage.usageCount === 'number' ? userData.aiUsage.usageCount : 0,
          dailyLimit: typeof userData.aiUsage.dailyLimit === 'number' ? userData.aiUsage.dailyLimit : 5,
        };
      } else {
        currentAiUsage = { ...defaultAiUsage };
      }

      debugLog('Current AI usage:', currentAiUsage);

      let newAiUsage;
      if (!currentAiUsage.lastUsedDate || currentAiUsage.lastUsedDate !== today) {
        newAiUsage = {
          ...currentAiUsage,
          usageCount: 0,
          lastUsedDate: today
        };
        debugLog('Reset usage for new day');
      } else {
        newAiUsage = { ...currentAiUsage };
        debugLog('Same day usage');
      }

      if (newAiUsage.usageCount >= newAiUsage.dailyLimit) {
        debugLog('Usage limit exceeded', {
          current: newAiUsage.usageCount,
          limit: newAiUsage.dailyLimit
        });
        return {
          success: false,
          error: `하루 사용 한도(${newAiUsage.dailyLimit}회)를 초과했습니다.`,
          usageCount: newAiUsage.usageCount,
          remainingUsage: 0,
        };
      }

      newAiUsage = {
        ...newAiUsage,
        usageCount: newAiUsage.usageCount + 1,
        lastUsedDate: today
      };

      debugLog('New AI usage:', newAiUsage);

      const updateData = {
        aiUsage: {
          usageCount: Math.max(0, Math.min(20, newAiUsage.usageCount)),
          dailyLimit: Math.max(1, Math.min(20, newAiUsage.dailyLimit)),
          lastUsedDate: today
        },
        lastAIUsedAt: serverTimestamp(),
      };

      debugLog('Updating AI usage with data:', updateData);

      await updateDoc(userRef, updateData);

      debugLog('AI usage incremented successfully', {
        newUsageCount: newAiUsage.usageCount,
        remainingUsage: newAiUsage.dailyLimit - newAiUsage.usageCount,
      });

      return {
        success: true,
        usageCount: newAiUsage.usageCount,
        dailyLimit: newAiUsage.dailyLimit,
        remainingUsage: newAiUsage.dailyLimit - newAiUsage.usageCount,
        isAdmin: false,
      };
    } catch (error) {
      console.error('Error incrementing AI usage:', error);
      debugLog('AI usage increment error', error);
      
      let errorMessage = 'AI 사용량 업데이트에 실패했습니다.';
      if (error.code === 'permission-denied') {
        errorMessage = '사용량 업데이트 권한이 없습니다. 로그인 상태를 확인해주세요.';
      } else if (error.code === 'not-found') {
        errorMessage = '사용자 정보를 찾을 수 없습니다.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = '올바르지 않은 사용량 데이터입니다.';
      } else if (error.message.includes('Cannot read properties')) {
        errorMessage = '사용자 데이터 구조에 문제가 있습니다. 관리자에게 문의하세요.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // AI 사용량 통계 조회 (관리자용)
  getAIUsageStats: async (adminUid) => {
    try {
      checkFirebaseServices();
      debugLog('Fetching AI usage stats', { adminUid });

      const adminRef = doc(db, 'users', adminUid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        return {
          success: false,
          error: '관리자 권한이 필요합니다.',
        };
      }

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const stats = {
        totalUsers: 0,
        todayActiveUsers: 0,
        totalUsageToday: 0,
        avgUsagePerUser: 0,
        usersByUsage: {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        },
      };

      const today = new Date().toISOString().split('T')[0];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.role === 'admin') return;

        stats.totalUsers++;

        const aiUsage = userData.aiUsage || { usageCount: 0, lastUsedDate: null };
        
        if (aiUsage.lastUsedDate === today) {
          stats.todayActiveUsers++;
          stats.totalUsageToday += aiUsage.usageCount;
          
          const usageCount = Math.min(aiUsage.usageCount, 5);
          stats.usersByUsage[usageCount]++;
        } else {
          stats.usersByUsage[0]++;
        }
      });

      if (stats.todayActiveUsers > 0) {
        stats.avgUsagePerUser = (stats.totalUsageToday / stats.todayActiveUsers).toFixed(2);
      }

      debugLog('AI usage stats calculated', stats);

      return {
        success: true,
        stats: stats,
        date: today,
      };
    } catch (error) {
      console.error('Error fetching AI usage stats:', error);
      debugLog('AI usage stats error', error);
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // Firebase 연결 테스트
  testConnection: async () => {
    try {
      debugLog('Testing Firebase connection');

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
      debugLog('Auth connection test', { success: authTest });

      let firestoreTest = false;
      try {
        firestoreTest = db.app !== undefined;
        debugLog('Firestore connection test', { success: firestoreTest });
      } catch (firestoreError) {
        console.warn('Firestore connection test failed:', firestoreError);
        debugLog('Firestore connection failed', firestoreError);
      }

      const overallSuccess = authTest && firestoreTest;
      debugLog('Overall Firebase connection test', { success: overallSuccess });

      return {
        success: true,
        connected: overallSuccess,
        details: {
          auth: authTest,
          firestore: firestoreTest,
        },
      };
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      debugLog('Firebase connection test failed', error);
      return {
        success: false,
        connected: false,
        error: error.message,
      };
    }
  },
};

// 데이터 정리 헬퍼 함수
const sanitizeAnalysisData = (data) => {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitize = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'function') return null;
    if (typeof obj === 'symbol') return null;
    if (obj instanceof Date) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(sanitize).filter(item => item !== null);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = sanitize(value);
      if (sanitizedValue !== null) {
        sanitized[key] = sanitizedValue;
      }
    }
    return sanitized;
  };

  return sanitize(data);
};

// Firebase 에러 메시지 한국어 변환
const getErrorMessage = errorCode => {
  const errorMessages = {
    // 인증 관련
    'auth/user-disabled': '계정이 비활성화되었습니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 9자 이상의 영문, 숫자, 특수문자를 조합해주세요.',
    'auth/password-does-not-meet-requirements': '비밀번호가 보안 요구사항을 충족하지 않습니다. 9자 이상의 영문, 숫자, 특수문자를 조합해주세요.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/invalid-credential': '잘못된 인증 정보입니다.',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/operation-not-allowed': '이 인증 방법은 허용되지 않습니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',

    // 팝업 관련
    'auth/popup-closed-by-user': '로그인 창이 사용자에 의해 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인 요청이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
    'auth/unauthorized-domain': '이 도메인은 Firebase 인증에 허가되지 않았습니다.',

    // Google 로그인 관련
    'auth/account-exists-with-different-credential': '다른 인증 방법으로 가입된 계정입니다.',
    'auth/credential-already-in-use': '이미 사용 중인 인증 정보입니다.',
    'auth/auth-domain-config-required': 'Firebase 인증 도메인 설정이 필요합니다.',

    // 일반적인 오류
    'auth/timeout': '요청 시간이 초과되었습니다.',
    'auth/missing-password': '비밀번호를 입력해주세요.',
    'auth/internal-error': '내부 오류가 발생했습니다. 다시 시도해주세요.',
    'auth/invalid-api-key': 'Firebase API 키가 올바르지 않습니다.',
    'auth/app-deleted': 'Firebase 앱이 삭제되었습니다.',
    'auth/expired-action-code': '만료된 인증 코드입니다.',
    'auth/invalid-action-code': '올바르지 않은 인증 코드입니다.',

    // Firestore 관련
    'firestore/permission-denied': 'Firestore 접근 권한이 없습니다. 로그인 상태를 확인해주세요.',
    'firestore/unavailable': 'Firestore 서비스를 사용할 수 없습니다.',
    'firestore/deadline-exceeded': 'Firestore 요청 시간이 초과되었습니다.',
    'firestore/unauthenticated': '인증이 필요합니다. 다시 로그인해주세요.',
  };

  return errorMessages[errorCode] || `인증 오류가 발생했습니다: ${errorCode}`;
};

export default app || null;