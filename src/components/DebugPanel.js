import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 표시
    if (process.env.NODE_ENV === 'development') {
      gatherDebugInfo();
    }
  }, []);

  const gatherDebugInfo = async () => {
    const info = {
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
      firebaseConfig: {
        authDomain: 'net-30335.firebaseapp.com',
        projectId: 'net-30335',
      },
      localStorage: {
        userSession: localStorage.getItem('userSession'),
      },
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      timestamp: new Date().toISOString(),
    };

    setDebugInfo(info);
  };

  const testFirebaseConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await authService.testConnection();
      setDebugInfo(prev => ({
        ...prev,
        connectionTest: {
          success: result.success,
          connected: result.connected,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        connectionTest: {
          success: false,
          connected: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setIsTestingConnection(false);
    }
  };

  const copyDebugInfo = () => {
    const debugText = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(debugText).then(() => {
      alert('디버그 정보가 클립보드에 복사되었습니다.');
    });
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('캐시가 삭제되었습니다. 페이지를 새로고침합니다.');
    window.location.reload();
  };

  // 개발 환경이 아니면 렌더링하지 않음
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 디버그 패널 토글 버튼 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200"
        title="Firebase 디버그 패널"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* 디버그 패널 */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Firebase 디버그 패널
              </h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 액션 버튼들 */}
              <div className="flex space-x-2 pb-4 border-b border-gray-200">
                <button
                  onClick={testFirebaseConnection}
                  disabled={isTestingConnection}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isTestingConnection
                    ? '테스트 중...'
                    : 'Firebase 연결 테스트'}
                </button>
                <button
                  onClick={gatherDebugInfo}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  정보 새로고침
                </button>
                <button
                  onClick={copyDebugInfo}
                  className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  정보 복사
                </button>
                <button
                  onClick={clearCache}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  캐시 삭제
                </button>
              </div>

              {/* 연결 테스트 결과 */}
              {debugInfo.connectionTest && (
                <div
                  className={`p-3 rounded-lg ${debugInfo.connectionTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  <h3 className="font-medium text-sm mb-2">
                    Firebase 연결 테스트 결과:
                  </h3>
                  <div className="text-sm space-y-1">
                    <div>
                      상태:{' '}
                      {debugInfo.connectionTest.connected
                        ? '✅ 연결됨'
                        : '❌ 연결 실패'}
                    </div>
                    {debugInfo.connectionTest.error && (
                      <div className="text-red-600">
                        오류: {debugInfo.connectionTest.error}
                      </div>
                    )}
                    <div className="text-gray-500">
                      테스트 시간: {debugInfo.connectionTest.timestamp}
                    </div>
                  </div>
                </div>
              )}

              {/* 시스템 정보 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">시스템 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>환경:</strong> {debugInfo.environment}
                  </div>
                  <div>
                    <strong>온라인 상태:</strong>{' '}
                    {debugInfo.onlineStatus ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>쿠키 활성화:</strong>{' '}
                    {debugInfo.cookiesEnabled ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>현재 URL:</strong> {debugInfo.url}
                  </div>
                </div>
              </div>

              {/* Firebase 설정 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Firebase 설정</h3>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>Auth Domain: {debugInfo.firebaseConfig?.authDomain}</div>
                  <div>Project ID: {debugInfo.firebaseConfig?.projectId}</div>
                </div>
              </div>

              {/* 로컬 스토리지 정보 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">로컬 스토리지</h3>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div>
                    <strong>사용자 세션:</strong>{' '}
                    {debugInfo.localStorage?.userSession || '없음'}
                  </div>
                </div>
              </div>

              {/* 브라우저 정보 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">브라우저 정보</h3>
                <div className="bg-gray-50 p-3 rounded text-xs break-all">
                  {debugInfo.userAgent}
                </div>
              </div>

              {/* 문제 해결 가이드 */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">
                  문제 해결 체크리스트
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="check1" className="mt-1" />
                    <label htmlFor="check1">
                      Firebase Console에서 Authentication 활성화됨
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="check2" className="mt-1" />
                    <label htmlFor="check2">Firestore Database 생성됨</label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="check3" className="mt-1" />
                    <label htmlFor="check3">
                      Authorized domains에 localhost 추가됨
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="check4" className="mt-1" />
                    <label htmlFor="check4">브라우저 팝업 차단 해제됨</label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="check5" className="mt-1" />
                    <label htmlFor="check5">인터넷 연결 정상</label>
                  </div>
                </div>
              </div>

              {/* 에러 패턴별 해결책 */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">
                  일반적인 에러 해결법
                </h3>
                <div className="text-sm space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <strong>auth/unauthorized-domain:</strong>
                    <p>
                      Firebase Console → Authentication → Settings → Authorized
                      domains에서 localhost 추가
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <strong>회원가입 멈춤:</strong>
                    <p>
                      1. Firestore Database 생성 확인
                      <br />
                      2. 네트워크 연결 확인
                      <br />
                      3. 브라우저 콘솔 에러 확인
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <strong>팝업 차단:</strong>
                    <p>
                      브라우저 설정에서 팝업 허용 또는 주소표시줄 옆의 팝업 차단
                      해제
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
