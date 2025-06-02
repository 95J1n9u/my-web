import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, serviceStatus, engineInfo }) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      description: '전체 현황',
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z"
          />
        </svg>
      ),
    },
    {
      id: 'upload',
      name: '파일 업로드',
      description: '설정 분석',
      icon: (
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      id: 'results',
      name: '분석 결과',
      description: '취약점 보고서',
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  // 서비스 상태에 따른 스타일
  const getServiceStatusColor = () => {
    switch (serviceStatus) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getServiceStatusText = () => {
    switch (serviceStatus) {
      case 'online':
        return '서비스 정상';
      case 'offline':
        return '서비스 오류';
      default:
        return '연결 확인 중';
    }
  };

  return (
    <div className="w-64 bg-gray-900 shadow-lg flex flex-col h-full">
      {/* Logo and Title */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 lg:w-6 h-4 lg:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              넷시큐어
            </h1>
            <p className="text-gray-400 text-xs lg:text-sm">
              다중 지침서 분석기
            </p>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center space-x-2 p-2 lg:p-3 bg-gray-800 rounded-lg">
          <div
            className={`w-2 h-2 rounded-full ${getServiceStatusColor()}`}
          ></div>
          <span className="text-xs lg:text-sm text-gray-300">
            {getServiceStatusText()}
          </span>
        </div>
      </div>

      {/* Engine Info - 간소화 */}
      {engineInfo && (
        <div className="px-4 lg:px-6 pb-4">
          <div className="p-2 lg:p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400 mb-1 lg:mb-2">분석 엔진</div>
            <div className="text-sm text-white font-medium mb-1">
              {engineInfo.engineVersion}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>
                {engineInfo.implementedFrameworks?.length || 0}개 지침서
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-3 py-3 mb-1 text-left transition-all duration-200 rounded-lg group ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span
              className={`mr-3 transition-transform duration-200 ${
                activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="font-medium text-sm lg:text-base">
                {item.name}
              </div>
              <div
                className={`text-xs mt-0.5 ${
                  activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Quick Stats - 간소화 */}
      <div className="px-4 lg:px-6 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">통계</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">
              {engineInfo?.implementedFrameworks?.length || 3}
            </div>
            <div className="text-xs text-gray-400">지침서</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">
              {engineInfo?.frameworkStats?.totalRules || 91}
            </div>
            <div className="text-xs text-gray-400">총 룰</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">10</div>
            <div className="text-xs text-gray-400">장비</div>
          </div>
        </div>
      </div>

      {/* Framework Status - 간소화 */}
      {engineInfo && engineInfo.supportedFrameworks && (
        <div className="px-4 lg:px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">지침서 현황</div>
          <div className="space-y-1">
            {['KISA', 'CIS', 'NW'].map(frameworkId => {
              const isImplemented =
                engineInfo.implementedFrameworks?.includes(frameworkId);

              return (
                <div
                  key={frameworkId}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-gray-300">{frameworkId}</span>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`w-2 h-2 rounded-full ${isImplemented ? 'bg-green-500' : 'bg-gray-500'}`}
                    ></span>
                    {frameworkId === 'NW' && isImplemented && (
                      <span className="px-1 py-0.5 text-xs bg-green-600 text-green-100 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 lg:px-6 py-4 border-t border-gray-800 mt-auto">
        <div className="text-center">
          <div className="text-xs text-gray-500">NetSecure v2.0</div>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <span className="inline-flex px-1.5 py-0.5 text-xs bg-blue-600 text-blue-100 rounded">
              KISA
            </span>
            <span className="inline-flex px-1.5 py-0.5 text-xs bg-orange-600 text-orange-100 rounded">
              CIS
            </span>
            <span className="inline-flex px-1.5 py-0.5 text-xs bg-green-600 text-green-100 rounded">
              NW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
