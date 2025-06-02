import React, { useState } from 'react';
import analysisService from '../services/analysisService';

const Header = ({
  serviceStatus,
  selectedFramework,
  frameworks,
  onFrameworkChange,
  engineInfo,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const [showFrameworkDropdown, setShowFrameworkDropdown] = useState(false);

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

  return (
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
          <div className="relative hidden lg:block">
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

            {/* Framework Dropdown - 간소화 */}
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
