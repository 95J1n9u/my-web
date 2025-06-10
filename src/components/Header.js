import React, { useState, useEffect } from 'react';
import analysisService from '../services/analysisService';
import LoginModal from './LoginModal'; // 🔥 SMS 인증이 제거된 로그인 모달
import { getRoleDisplayName, getRoleColor } from '../utils/permissions';
import { authService } from '../config/firebase'; // 🔥 알림 기능을 위해 추가

const Header = ({
  serviceStatus,
  selectedFramework,
  frameworks,
  onFrameworkChange,
  engineInfo,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  user,
  onLogin,
  onLogout,
}) => {
  const [showFrameworkDropdown, setShowFrameworkDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  // 🔥 알림 관련 상태 추가
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const getFrameworkInfo = frameworkId =>
    analysisService.getFrameworkInfo(frameworkId);
  const currentFrameworkInfo = getFrameworkInfo(selectedFramework);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  // 🔥 알림 데이터 로드
  const loadNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const [notificationsResult, unreadResult] = await Promise.all([
        authService.getUserNotifications(user.uid, 10),
        authService.getUnreadNotificationCount(user.uid)
      ]);
      
      if (notificationsResult.success) {
        setNotifications(notificationsResult.notifications);
      }
      
      if (unreadResult.success) {
        setUnreadCount(unreadResult.count);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // 🔥 사용자가 로그인했을 때 알림 로드
  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      // 10초마다 알림 갱신
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.uid]);

  // 🔥 알림 클릭 처리
  const handleNotificationClick = async (notification) => {
    // 알림을 읽음 처리
    if (!notification.isRead) {
      await authService.markNotificationAsRead(notification.id, user.uid);
    }
    
    // 게시글로 이동 (예시)
    if (notification.data?.postId) {
      window.location.href = `#/community/post/${notification.data.postId}`;
    }
    
    setShowNotificationDropdown(false);
    loadNotifications(); // 알림 새로고침
  };

  // 🔥 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await authService.markAllNotificationsAsRead(user.uid);
      loadNotifications();
    }
  };

  // 🔥 알림 시간 포맷
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 서비스 상태에 따른 스타일
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

  // Firebase 로그인 성공 처리
  const handleLoginSuccess = userData => {
    console.log('Header: 로그인 성공 처리', userData);

    if (typeof onLogin === 'function') {
      onLogin(userData);
    } else {
      console.error('Header: onLogin is not a function', onLogin);
    }

    setShowLoginModal(false);
    // 🔥 로그인 후 알림 로드
    setTimeout(loadNotifications, 1000);
  };

  // Firebase 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log('Header: 로그아웃 처리 시작');

      if (typeof onLogout === 'function') {
        await onLogout();
      } else {
        console.error('Header: onLogout is not a function', onLogout);
      }

      setShowUserDropdown(false);
      // 🔥 로그아웃 시 알림 상태 초기화
      setNotifications([]);
      setUnreadCount(0);
      console.log('Header: 로그아웃 처리 완료');
    } catch (error) {
      console.error('Header: 로그아웃 오류:', error);
    }
  };

  // 외부 클릭 감지 (드롭다운 닫기)
  React.useEffect(() => {
    const handleClickOutside = event => {
      if (!event.target.closest('.framework-dropdown')) {
        setShowFrameworkDropdown(false);
      }
      if (!event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
      // 🔥 알림 드롭다운 닫기
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* 모바일 햄버거 메뉴 - 개선된 애니메이션 */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="메뉴 토글"
            >
              <div className="w-6 h-6 flex flex-col justify-around">
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 transform ${
                    isMobileSidebarOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
                    isMobileSidebarOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 transform ${
                    isMobileSidebarOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>

            {/* 로고 및 타이틀 - 개선된 디자인 */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                <a href="/Dashboard" className="hover:text-blue-600 transition-colors duration-200">
                  <span className="hidden sm:inline">네트워크 취약점 분석 도구</span>
                  <span className="sm:hidden">넷시큐어</span>
                </a>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Service Status Indicator - 개선된 디자인 */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <div
                className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full ${getStatusColor()} animate-pulse`}
              ></div>
              <span className="text-xs lg:text-sm text-gray-600 font-medium hidden sm:block">
                {getStatusText()}
              </span>
            </div>

            {/* Current Framework Info - 개선된 디자인 */}
            {currentFramework && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200">
                {currentFrameworkInfo && (
                  <span
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: currentFrameworkInfo.color }}
                  />
                )}
                <span className="text-xs lg:text-sm text-gray-700 font-medium">
                  <span className="hidden sm:inline">
                    {currentFramework.total_rules}개 룰셋
                  </span>
                  <span className="sm:hidden">{selectedFramework}</span>
                </span>
              </div>
            )}

            {/* 🔥 알림 버튼 추가 (로그인한 사용자만) */}
            {user && (
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="알림"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3M6 14l3 3-3 3M14 7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V7zM3 7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                  {/* 🔥 알림 배지 */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* 🔥 알림 드롭다운 */}
                {showNotificationDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-900">알림</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          모두 읽음
                        </button>
                      )}
                    </div>

                    {/* 알림 목록 */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3M6 14l3 3-3 3" />
                          </svg>
                          <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* 알림 아이콘 */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                notification.type === 'comment' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.type === 'comment' ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* 알림 내용 */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 leading-relaxed">
                                  {notification.data?.message || '새로운 알림이 있습니다.'}
                                </p>
                                {notification.data?.postTitle && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    게시글: {notification.data.postTitle}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                              </div>
                              
                              {/* 읽지 않음 표시 */}
                              {!notification.isRead && (
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 푸터 */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                        <button className="text-xs text-blue-600 hover:text-blue-700 underline">
                          모든 알림 보기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Authentication Section - 개선된 디자인 */}
            {user ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden ring-2 ring-white shadow-sm">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || user.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.displayName?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block max-w-32 truncate">
                    {user.displayName || user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      showUserDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown - 개선된 디자인 */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4">
                      {/* 사용자 정보 */}
                      <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                        <div className="flex-shrink-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || user.email}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium ring-2 ring-gray-200">
                              {user.displayName?.charAt(0).toUpperCase() ||
                                user.email?.charAt(0).toUpperCase() ||
                                'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.displayName || '사용자'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                          <div className="mt-1.5">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 메뉴 항목들 */}
                      <div className="mt-3">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                        >
                          <svg
                            className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden sm:inline">로그인</span>
              </button>
            )}
          </div>
        </div>

        {/* Framework Status Bar - 개선된 디자인 */}
        {engineInfo && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-4 lg:px-6 py-3 hidden lg:block">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Engine: {engineInfo.engineVersion}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>
                  구현: {engineInfo.implementedFrameworks?.length || 0}개
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  총 룰:{' '}
                  {frameworks
                    .filter(f => f.isImplemented)
                    .reduce((sum, f) => sum + (f.total_rules || 0), 0)}
                  개
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {engineInfo.features?.multiFrameworkSupport && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    다중 지침서
                  </span>
                )}
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                  user
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    user ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  분석결과 저장 {user ? '활성' : '비활성'}
                </span>
                
                {user && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    인증됨
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 🔥 SMS 인증이 제거된 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

export default Header;