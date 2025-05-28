import React, { useState } from 'react';
import analysisService from '../services/analysisService';

const Header = ({ 
  serviceStatus, 
  selectedFramework, 
  frameworks, 
  onFrameworkChange, 
  engineInfo 
}) => {
  const [showFrameworkDropdown, setShowFrameworkDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getFrameworkInfo = (frameworkId) => analysisService.getFrameworkInfo(frameworkId);
  const currentFrameworkInfo = getFrameworkInfo(selectedFramework);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  // 서비스 상태에 따른 스타일
  const getStatusColor = () => {
    switch (serviceStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (serviceStatus) {
      case 'online': return '온라인';
      case 'offline': return '오프라인';
      default: return '연결 중';
    }
  };

  // 알림 메시지 (구현되지 않은 지침서 등)
  const getNotifications = () => {
    const notifications = [];
    
    // 구현되지 않은 지침서 알림
    const unimplementedFrameworks = frameworks.filter(f => !f.isImplemented);
    if (unimplementedFrameworks.length > 0) {
      notifications.push({
        id: 'unimplemented-frameworks',
        type: 'info',
        title: '새로운 지침서 구현 예정',
        message: `${unimplementedFrameworks.map(f => f.id).join(', ')} 지침서가 곧 추가될 예정입니다.`,
        timestamp: new Date().toISOString()
      });
    }

    // 서비스 오프라인 알림
    if (serviceStatus === 'offline') {
      notifications.push({
        id: 'service-offline',
        type: 'error',
        title: '서비스 연결 오류',
        message: '분석 서비스에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        timestamp: new Date().toISOString()
      });
    }

    return notifications;
  };

  const notifications = getNotifications();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-800">네트워크 보안 분석</h2>
          
          {/* Framework Selector */}
          <div className="relative">
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
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showFrameworkDropdown ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Framework Dropdown */}
            {showFrameworkDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-2">
                    보안 지침서 선택
                  </div>
                  {frameworks.map((framework) => {
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
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{framework.id}</span>
                            {!framework.isImplemented && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                구현 예정
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {framework.description}
                          </div>
                          {framework.total_rules && (
                            <div className="text-xs text-gray-400 mt-1">
                              {framework.total_rules}개 보안 룰셋
                            </div>
                          )}
                        </div>
                        {selectedFramework === framework.id && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Engine Info */}
                {engineInfo && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center justify-between mb-1">
                        <span>Engine Version:</span>
                        <span className="font-medium">{engineInfo.engineVersion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>API Version:</span>
                        <span className="font-medium">{engineInfo.version}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="검색..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5a6 6 0 1012 0z" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">알림</h3>
                    <span className="text-xs text-gray-500">{notifications.length}개</span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex space-x-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'error' ? 'bg-red-500' : 
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Service Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm text-gray-600">{getStatusText()}</span>
          </div>

          {/* Current Framework Info */}
          {currentFramework && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              {currentFrameworkInfo && (
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentFrameworkInfo.color }}
                />
              )}
              <span className="text-sm text-gray-600">
                {currentFramework.total_rules}개 룰셋
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                currentFramework.isImplemented 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentFramework.isImplemented ? '활성' : '예정'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Framework Status Bar */}
      {engineInfo && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <span>Engine: {engineInfo.engineVersion}</span>
              <span>•</span>
              <span>지원 지침서: {engineInfo.supportedFrameworks?.length || 0}개</span>
              <span>•</span>
              <span>구현 완료: {engineInfo.implementedFrameworks?.length || 0}개</span>
            </div>
            <div className="flex items-center space-x-2">
              {engineInfo.features?.multiFrameworkSupport && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  다중 지침서 지원
                </span>
              )}
              {engineInfo.features?.frameworkComparison && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  비교 분석
                </span>
              )}
              {engineInfo.features?.logicalAnalysis && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  논리 분석
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