import React, { useState } from 'react';
import analysisService from '../services/analysisService';
import LoginModal from './LoginModal';

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

  const getFrameworkInfo = frameworkId =>
    analysisService.getFrameworkInfo(frameworkId);
  const currentFrameworkInfo = getFrameworkInfo(selectedFramework);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

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

    // onLogin이 함수인지 확인
    if (typeof onLogin === 'function') {
      onLogin(userData);
    } else {
      console.error('Header: onLogin is not a function', onLogin);
    }

    setShowLoginModal(false);
  };

  // Firebase 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log('Header: 로그아웃 처리 시작');

      // onLogout이 함수인지 확인
      if (typeof onLogout === 'function') {
        await onLogout();
      } else {
        console.error('Header: onLogout is not a function', onLogout);
      }

      setShowUserDropdown(false);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* 모바일 햄버거 메뉴 */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="메뉴 토글"
            >
              <div className="w-6 h-6 flex flex-col justify-around">
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
                    isMobileSidebarOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
                    isMobileSidebarOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${
                    isMobileSidebarOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>

            <h2 className="text-lg lg:text-2xl font-semibold text-gray-800">
              <span className="hidden sm:inline">네트워크 보안 분석</span>
              <span className="sm:hidden">넷시큐어</span>
            </h2>

            {/* Framework Selector - 데스크톱만 표시 */}
            <div className="relative hidden lg:block framework-dropdown">
              <button
                onClick={() => setShowFrameworkDropdown(!showFrameworkDropdown)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={serviceStatus === 'offline'}
              >
                {currentFrameworkInfo && (
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentFrameworkInfo.color }}
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {selectedFramework}
                </span>
                {currentFramework?.total_rules && (
                  <span className="text-xs text-gray-500">
                    ({currentFramework.total_rules}룰)
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showFrameworkDropdown ? 'rotate-180' : ''
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

              {/* Framework Dropdown */}
              {showFrameworkDropdown && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-2">
                      보안 지침서 선택
                    </div>
                    {frameworks.map(framework => {
                      const info = getFrameworkInfo(framework.id);
                      return (
                        <button
                          key={framework.id}
                          onClick={() => {
                            if (framework.isImplemented) {
                              onFrameworkChange(framework.id);
                            }
                            setShowFrameworkDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                            selectedFramework === framework.id
                              ? 'bg-blue-50 text-blue-700'
                              : framework.isImplemented
                                ? 'hover:bg-gray-50 text-gray-700'
                                : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!framework.isImplemented}
                        >
                          {info && (
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: info.color }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {framework.id}
                              </span>
                              <div className="flex items-center space-x-1">
                                {framework.total_rules && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    {framework.total_rules}룰
                                  </span>
                                )}
                                {!framework.isImplemented && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                    예정
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {framework.description}
                            </div>
                          </div>
                          {selectedFramework === framework.id && (
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Service Status Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${getStatusColor()}`}
              ></div>
              <span className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                {getStatusText()}
              </span>
            </div>

            {/* Current Framework Info - 모바일용 간소화 */}
            {currentFramework && (
              <div className="flex items-center space-x-2 px-2 lg:px-3 py-1 lg:py-2 bg-gray-50 rounded-lg">
                {currentFrameworkInfo && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentFrameworkInfo.color }}
                  />
                )}
                <span className="text-xs lg:text-sm text-gray-600">
                  <span className="hidden sm:inline">
                    {currentFramework.total_rules}개 룰셋
                  </span>
                  <span className="sm:hidden">{selectedFramework}</span>
                </span>
              </div>
            )}

            {/* Authentication Section */}
            {user ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden">
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

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      {/* 사용자 정보 */}
                      <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                        <div className="flex-shrink-0">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {user.displayName?.charAt(0).toUpperCase() ||
                                user.email?.charAt(0).toUpperCase() ||
                                'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName || '사용자'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                          {user.analysisCount !== undefined && (
                            <div className="text-xs text-blue-600 mt-1">
                              분석 {user.analysisCount || 0}회 수행
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 메뉴 항목들 */}
                      <div className="mt-3 space-y-1">
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <svg
                            className="w-4 h-4 inline mr-2"
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
                          프로필 설정
                        </button>

                        <button
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <svg
                            className="w-4 h-4 inline mr-2"
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
                          분석 기록
                        </button>

                        <div className="border-t border-gray-100 my-2"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 inline mr-2"
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
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
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

        {/* Framework Status Bar - 간소화 */}
        {engineInfo && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 lg:px-6 py-2 hidden lg:block">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <span>Engine: {engineInfo.engineVersion}</span>
                <span>•</span>
                <span>
                  구현: {engineInfo.implementedFrameworks?.length || 0}개
                </span>
                <span>•</span>
                <span>
                  총 룰:{' '}
                  {frameworks
                    .filter(f => f.isImplemented)
                    .reduce((sum, f) => sum + (f.total_rules || 0), 0)}
                  개
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {engineInfo.features?.multiFrameworkSupport && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    다중 지침서
                  </span>
                )}
                {frameworks.some(f => f.id === 'NW' && f.isImplemented) && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    NW 추가
                  </span>
                )}
                {user && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    인증됨
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
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
