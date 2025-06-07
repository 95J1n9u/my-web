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
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  console.log('Firebase 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
  // 기본값 설정으로 앱이 크래시되지 않도록 함
  auth = null;
  db = null;
}

// Firebase 서비스들을 안전하게 export
export { auth, db };

// 개발 환경에서 에뮬레이터 사용 (선택사항)
// Firebase 에뮬레이터를 사용하려면 아래 주석을 해제하세요
// if (process.env.NODE_ENV === 'development') {
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firebase 에뮬레이터 연결 실패 (정상적인 경우입니다):', error.message);
//   }
// }

// Google Auth Provider 설정
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '', // 특정 도메인 제한이 있다면 여기에 설정
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
  getSystemStats: async (adminUid) => {
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
        if (userData.lastLoginAt && userData.lastLoginAt.toDate() > thirtyDaysAgo) {
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

// 이메일/비밀번호 회원가입
signUpWithEmail: async (email, password, displayName) => {
  try {
    checkFirebaseServices();
    debugLog('Starting email signup', { email, displayName });

    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    debugLog('User created successfully', { uid: user.uid });

    // 이메일 인증 발송
    debugLog('Sending email verification');
    await sendEmailVerification(user, {
      url: window.location.origin + '/dashboard', // 인증 완료 후 리다이렉트 URL
      handleCodeInApp: false,
    });

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: displayName,
    });

    debugLog('Profile updated');

    // Firestore에 사용자 정보 저장 (이메일 인증 상태 포함)
    const userDocData = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'user', // 기본 역할
      emailVerified: false, // 이메일 인증 상태
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

    debugLog('Saving user to Firestore', userDocData);

    await setDoc(doc(db, 'users', user.uid), userDocData);

    debugLog('User saved to Firestore successfully');

    // 이메일 인증이 필요함을 알리는 특별한 응답
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
    console.error('Sign up error:', error);
    debugLog('Signup error details', error);

    return {
      success: false,
      error: getErrorMessage(error.code),
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
      // 이메일 인증 확인
      if (!user.emailVerified) {
        return {
          success: false,
          error: '이메일 인증이 완료되지 않았습니다. 이메일을 확인하고 인증을 완료해주세요.',
          requiresEmailVerification: true,
        };
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
      authorId: uid, // 이 필드가 중요합니다
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
      priority: noticeData.priority || 'normal', // normal, high, urgent
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
    let q = query(
      postsRef,
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (category && category !== 'all') {
      q = query(
        postsRef,
        where('isPublished', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach(doc => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    debugLog('Posts fetched successfully', { count: posts.length });

    return {
      success: true,
      posts: posts,
      count: posts.length,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    debugLog('Posts fetch error', error);
    return {
      success: false,
      error: getErrorMessage(error.code) || error.message,
      posts: [],
    };
  }
},

// 공지사항 목록 조회 (인덱스 문제 해결)
getNotices: async (limitCount = 10) => {
  try {
    checkFirebaseServices();
    debugLog('Fetching notices', { limitCount });

    const noticesRef = collection(db, 'notices');
    // 단순한 쿼리로 변경 (where + orderBy 복합 인덱스 문제 해결)
    const q = query(
      noticesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // 여유분을 두고 가져온 후 클라이언트에서 필터링
    );

    const querySnapshot = await getDocs(q);
    const notices = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      // 클라이언트 사이드에서 isPublished 필터링
      if (data.isPublished === true) {
        notices.push({
          id: doc.id,
          ...data,
        });
      }
    });

    // 최대 개수로 제한
    const limitedNotices = notices.slice(0, limitCount);

    // 클라이언트 사이드에서 isPinned로 정렬
    limitedNotices.sort((a, b) => {
      // 먼저 isPinned로 정렬 (고정된 글이 위로)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // 그 다음 createdAt으로 정렬
      const aDate = a.createdAt ? a.createdAt.toDate() : new Date(0);
      const bDate = b.createdAt ? b.createdAt.toDate() : new Date(0);
      return bDate - aDate;
    });

    debugLog('Notices fetched successfully', { count: limitedNotices.length });

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
// 게시글 수정 (새로 추가)
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

    // 작성자 확인
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

// 게시글 삭제 (새로 추가)
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

    // 작성자 확인
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
getPost: async (postId) => {
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

    // 조회수 증가 - 실패해도 무시
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

// 공지사항 상세 조회 및 조회수 증가
getNotice: async (noticeId) => {
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

    // 조회수 증가 - 실패해도 무시
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
// 공지사항 삭제 (관리자 전용) - 새로 추가
deleteNotice: async (noticeId, adminUid) => {
  try {
    checkFirebaseServices();
    debugLog('Deleting notice', { noticeId, adminUid });

    // 관리자 권한 확인
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
// 공지사항 수정 (관리자 전용) - 새로 추가
updateNotice: async (noticeId, adminUid, updateData) => {
  try {
    checkFirebaseServices();
    debugLog('Updating notice', { noticeId, adminUid, updateData });

    // 관리자 권한 확인
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
// 최대한 단순한 게시글 조회
getPosts: async (limitCount = 20, category = null) => {
  try {
    checkFirebaseServices();
    debugLog('Fetching posts', { limitCount, category });

    const postsRef = collection(db, 'posts');
    // 가장 단순한 쿼리
    const q = query(postsRef, limit(100));

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const isPublished = data.isPublished === true;
      const matchesCategory = !category || category === 'all' || data.category === category;
      
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
      // 새 사용자인 경우 Firestore에 정보 저장
      userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user', // 기본 역할
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
      // 기존 사용자의 마지막 로그인 시간 업데이트
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        photoURL: user.photoURL, // 프로필 사진 업데이트
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

    // 특별한 Google 로그인 에러 처리
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
      return () => {}; // 빈 함수 반환하여 에러 방지
    }
  },

// 사용자 분석 횟수 증가
  incrementAnalysisCount: async uid => {
    try {
      checkFirebaseServices();
      debugLog('Incrementing analysis count', { uid });
      const userRef = doc(db, 'users', uid);
      
      // 현재 문서 가져오기
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
          newCount: newCount 
        });
        
        return {
          success: true,
          newCount: newCount,
        };
      } else {
        // 문서가 없으면 생성
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

  // 분석 결과 저장 (새로 추가)
  saveAnalysisResult: async (uid, analysisData) => {
    try {
      checkFirebaseServices();
      debugLog('Saving analysis result', { uid, analysisData });

      // 분석 결과 데이터 구조화
      const analysisDoc = {
        userId: uid,
        timestamp: serverTimestamp(),
        deviceType: analysisData.deviceType,
        framework: analysisData.framework,
        fileName: analysisData.fileName,
        fileSize: analysisData.fileSize,
        isComparison: analysisData.isComparison || false,
        comparisonFrameworks: analysisData.comparisonFrameworks || null,

        // 분석 결과 요약
        summary: {
          totalChecks: analysisData.summary?.totalChecks || 0,
          vulnerabilities: analysisData.summary?.vulnerabilities || 0,
          highSeverity: analysisData.summary?.highSeverity || 0,
          mediumSeverity: analysisData.summary?.mediumSeverity || 0,
          lowSeverity: analysisData.summary?.lowSeverity || 0,
          passed: analysisData.summary?.passed || 0,
          securityScore: analysisData.summary?.securityScore || 0,
        },

        // 메타데이터
        metadata: {
          analysisTime: analysisData.metadata?.analysisTime || 0,
          engineVersion: analysisData.metadata?.engineVersion || 'Unknown',
          totalLines: analysisData.metadata?.totalLines || 0,
          frameworkInfo: analysisData.metadata?.frameworkInfo || null,
        },

        // 취약점 목록 (처음 10개만 저장하여 용량 절약)
        vulnerabilities: (analysisData.vulnerabilities || [])
          .slice(0, 10)
          .map(vuln => ({
            id: vuln.id,
            severity: vuln.severity,
            type: vuln.type,
            description: vuln.description,
            ruleId: vuln.ruleId,
            framework: vuln.framework,
            line: vuln.line,
          })),

        // 저장 시간
        createdAt: serverTimestamp(),
      };

      // Firestore에 저장
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
      return {
        success: false,
        error: getErrorMessage(error.code) || error.message,
      };
    }
  },

  // 사용자의 분석 기록 조회 (새로 추가)
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

  // 특정 분석 결과 삭제 (새로 추가)
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

  // 사용자의 분석 통계 조회 (새로 추가)
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
        monthlyAnalyses: 0, // 최근 30일
      };

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      let totalScore = 0;
      let scoreCount = 0;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        stats.totalAnalyses++;

        // 취약점 수 누적
        stats.totalVulnerabilities += data.summary?.vulnerabilities || 0;

        // 지침서 사용 통계
        const framework = data.framework;
        if (framework) {
          stats.frameworkUsage[framework] =
            (stats.frameworkUsage[framework] || 0) + 1;
        }

        // 장비 타입 사용 통계
        const deviceType = data.deviceType;
        if (deviceType) {
          stats.deviceTypeUsage[deviceType] =
            (stats.deviceTypeUsage[deviceType] || 0) + 1;
        }

        // 보안 점수 평균 계산
        if (data.summary?.securityScore) {
          totalScore += data.summary.securityScore;
          scoreCount++;
        }

        // 최근 30일 분석 수
        if (data.timestamp && data.timestamp.toDate() > thirtyDaysAgo) {
          stats.monthlyAnalyses++;
        }

        // 마지막 분석 날짜
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

      // 평균 보안 점수 계산
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

  // Firebase 연결 테스트
  testConnection: async () => {
    try {
      debugLog('Testing Firebase connection');

      // Firebase 서비스 초기화 확인
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

      // Auth 연결 테스트
      const authTest = auth.currentUser !== undefined;
      debugLog('Auth connection test', { success: authTest });

      // Firestore 연결 테스트 (간단한 방법)
      let firestoreTest = false;
      try {
        // Firestore 앱 인스턴스 확인
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

// Firebase 에러 메시지 한국어 변환 (확장됨)
const getErrorMessage = errorCode => {
  const errorMessages = {
    // 인증 관련
    'auth/user-disabled': '계정이 비활성화되었습니다.',
    'auth/user-not-found': '존재하지 않는 계정입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. 9자 이상의 영문, 숫자, 특수문자를 조합해주세요.',
    'auth/password-does-not-meet-requirements': '비밀번호가 보안 요구사항을 충족하지 않습니다.\n9자 이상의 영문, 숫자, 특수문자를 조합해주세요.',
    'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    'auth/invalid-credential': '잘못된 인증 정보입니다.',
    'auth/too-many-requests':
      '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/operation-not-allowed': '이 인증 방법은 허용되지 않습니다.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',

    // 팝업 관련
    'auth/popup-closed-by-user': '로그인 창이 사용자에 의해 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인 요청이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업을 허용해주세요.',
    'auth/unauthorized-domain':
      '이 도메인은 Firebase 인증에 허가되지 않았습니다. Firebase Console에서 도메인을 추가해주세요.',

    // Google 로그인 관련
    'auth/account-exists-with-different-credential':
      '다른 인증 방법으로 가입된 계정입니다.',
    'auth/credential-already-in-use': '이미 사용 중인 인증 정보입니다.',
    'auth/auth-domain-config-required':
      'Firebase 인증 도메인 설정이 필요합니다.',

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
