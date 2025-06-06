import React, { useState, useEffect } from 'react';

const FirebaseTest = () => {
  const [firebaseStatus, setFirebaseStatus] = useState({
    loading: true,
    installed: false,
    configured: false,
    error: null,
  });

  useEffect(() => {
    testFirebaseInstallation();
  }, []);

  const testFirebaseInstallation = async () => {
    try {
      // 1. Firebase 라이브러리 설치 확인
      console.log('1. Firebase 라이브러리 설치 확인...');

      let firebaseInstalled = false;
      let firebaseConfigured = false;
      let error = null;

      try {
        // Firebase 라이브러리 동적 import 테스트
        const { initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');

        firebaseInstalled = true;
        console.log('✅ Firebase 라이브러리 설치됨');

        // 2. Firebase 설정 테스트
        console.log('2. Firebase 설정 테스트...');

        const testConfig = {
          apiKey: 'AIzaSyBz7XX1dbo7UU14AD4jJ1-2EFwxOWoP1bU',
          authDomain: 'net-30335.firebaseapp.com',
          projectId: 'net-30335',
          storageBucket: 'net-30335.firebasestorage.app',
          messagingSenderId: '44418901752',
          appId: '1:44418901752:web:f246bd4d454b15c9a6bd0d',
        };

        // 임시 앱 초기화 테스트
        const testApp = initializeApp(testConfig, 'test-app');
        const testAuth = getAuth(testApp);
        const testDb = getFirestore(testApp);

        if (testAuth && testDb) {
          firebaseConfigured = true;
          console.log('✅ Firebase 설정 완료');
        }
      } catch (importError) {
        console.error('❌ Firebase 라이브러리 오류:', importError);
        error = `Firebase 라이브러리 오류: ${importError.message}`;
      }

      setFirebaseStatus({
        loading: false,
        installed: firebaseInstalled,
        configured: firebaseConfigured,
        error: error,
      });
    } catch (error) {
      console.error('Firebase 테스트 실패:', error);
      setFirebaseStatus({
        loading: false,
        installed: false,
        configured: false,
        error: error.message,
      });
    }
  };

  const retryTest = () => {
    setFirebaseStatus({ ...firebaseStatus, loading: true });
    testFirebaseInstallation();
  };

  if (firebaseStatus.loading) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">
            Firebase 연결 테스트 중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Firebase 상태</h3>
          <button
            onClick={retryTest}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            다시 테스트
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${firebaseStatus.installed ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-xs text-gray-600">
              Firebase 라이브러리:{' '}
              {firebaseStatus.installed ? '설치됨' : '설치 필요'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${firebaseStatus.configured ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-xs text-gray-600">
              Firebase 설정: {firebaseStatus.configured ? '완료' : '오류'}
            </span>
          </div>
        </div>

        {firebaseStatus.error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {firebaseStatus.error}
          </div>
        )}

        {!firebaseStatus.installed && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <div className="font-medium mb-1">해결 방법:</div>
            <div>
              터미널에서 실행:{' '}
              <code className="bg-yellow-100 px-1 rounded">
                npm install firebase
              </code>
            </div>
          </div>
        )}

        {firebaseStatus.installed && !firebaseStatus.configured && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <div className="font-medium mb-1">확인 사항:</div>
            <div>1. Firebase Console 설정 확인</div>
            <div>2. 인터넷 연결 확인</div>
            <div>3. 브라우저 콘솔 에러 확인</div>
          </div>
        )}

        {firebaseStatus.installed && firebaseStatus.configured && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            ✅ Firebase 연결 준비 완료!
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseTest;
