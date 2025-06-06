import React, { useState } from 'react';

const Sidebar = ({
  activeTab,
  setActiveTab,
  serviceStatus,
  engineInfo,
  user,
  analysisRecordCount = 0, // 새로 추가: 실제 저장된 기록 수
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (serviceStatus) {
      case 'online':
        return '온라인';
      case 'offline':
        return '오프라인';
      default:
        return '연결 중';
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5v0M16 5v0"
          />
        </svg>
      ),
    },
    {
      id: 'upload',
      name: '파일 분석',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      id: 'results',
      name: '분석 결과',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    // 로그인한 사용자에게만 보이는 메뉴
    ...(user
      ? [
          {
            id: 'history',
            name: '분석 기록',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            // 수정: 실제 저장된 기록 수 표시
            badge: analysisRecordCount > 0 ? analysisRecordCount : null,
          },
        ]
      : []),
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <a href="/Dashboard">
            <h1 className="text-lg font-bold text-gray-900">NetSecure</h1>
            <p className="text-xs text-gray-500">다중 지침서 분석기</p>
            </a>
          </div>
        </div>
      </div>

      {/* 사용자 정보 (로그인한 경우) */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user.displayName?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    'U'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || '사용자'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          {/* 수정: 총 분석 횟수와 저장된 기록 수를 구분하여 표시 */}
          <div className="mt-2 text-xs text-blue-600">
            
            {analysisRecordCount > 0 && (
              <div className="text-green-600">
                {analysisRecordCount}개 기록 저장됨
              </div>
            )}
          </div>
        </div>
      )}

      {/* 내비게이션 메뉴 */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === item.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-200 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* 서비스 상태 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm text-gray-600">{getStatusText()}</span>
        </div>

        {/* 엔진 정보 */}
        {engineInfo && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Engine: {engineInfo.engineVersion}</div>
            <div>
              지원: {engineInfo.implementedFrameworks?.length || 0}/
              {engineInfo.supportedFrameworks?.length || 0}개 지침서
            </div>
            {engineInfo.frameworkStats && (
              <div>총 {engineInfo.frameworkStats.totalRules}개 룰</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;