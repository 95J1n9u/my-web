import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';


const Sidebar = ({
  activeTab,
  setActiveTab,
  serviceStatus,
  engineInfo,
  user,
  analysisRecordCount = 0,
  onShowTerms,
  onShowPrivacy,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAdmin } = useAuth(user);

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
            badge: analysisRecordCount > 0 ? analysisRecordCount : null,
          },
      ]
    : []),
      {
    id: 'community',
    name: '커뮤니티',
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
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-4 9l4-4 4 4m-4-4v9"
        />
      </svg>
    ),
  },
  {
    id: 'notices',
    name: '공지사항',
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
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
  },



    // 관리자에게만 보이는 메뉴 (추가)
    ...(isAdmin()
      ? [
          {
            id: 'admin',
            name: '관리자 패널',
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
            badge: '관리자',
            isAdmin: true, // 관리자 메뉴 표시를 위한 플래그
          },
        ]
      : []),

    // 🔥 개발자 도구 (개발 환경에서만)
    ...(process.env.NODE_ENV === 'development'
      ? [
          {
            id: 'dev-tools',
            name: '🔧 개발자 도구',
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
            badge: '개발',
            isDev: true,
          },
          {
            id: 'emergency-sms',
            name: '🚑 SMS 테스트',
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ),
            badge: '문제해결',
            isDev: true,
          },
        ]
      : []),
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* 헤더 */}
<div className="p-6 border-b border-gray-200">
  <div className="flex items-center justify-center">
    <a href="/Dashboard">
      <img 
        src="logo.png" 
        alt="NetSecure Logo" 
        className="h-16 w-auto hover:opacity-80 transition" 
      />
    </a>
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
                ? item.isAdmin 
                  ? 'bg-red-100 text-red-700' // 관리자 메뉴 활성화 시 빨간색
                  : item.isDev
                    ? 'bg-orange-100 text-orange-700' // 개발 메뉴 활성화 시 주황색
                    : 'bg-blue-100 text-blue-700'
                : item.isAdmin
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700' // 관리자 메뉴 기본 스타일
                  : item.isDev
                    ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700' // 개발 메뉴 기본 스타일
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                item.isAdmin 
                  ? 'text-red-800 bg-red-200'
                  : 'text-blue-800 bg-blue-200'
              }`}>
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
          <div className="text-xs text-gray-500 space-y-1 mb-3">
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

        {/* 법적 고지 링크 */}
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex space-x-3">
              <button
                onClick={onShowTerms}
                className="text-gray-400 hover:text-gray-600 underline transition-colors duration-200"
              >
                이용약관
              </button>
              <button
                onClick={onShowPrivacy}
                className="text-gray-400 hover:text-gray-600 underline transition-colors duration-200"
              >
                개인정보
              </button>
            </div>
            <div className="text-gray-300">
              © 2024 NetSecure. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;