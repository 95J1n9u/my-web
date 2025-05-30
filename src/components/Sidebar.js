import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, serviceStatus, engineInfo }) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      description: '전체 현황 및 통계',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      id: 'upload',
      name: '파일 업로드',
      description: '설정 파일 분석',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      id: 'results',
      name: '분석 결과',
      description: '취약점 및 권고사항',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // 서비스 상태에 따른 스타일
  const getServiceStatusColor = () => {
    switch (serviceStatus) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getServiceStatusText = () => {
    switch (serviceStatus) {
      case 'online': return '서비스 정상';
      case 'offline': return '서비스 오류';
      default: return '연결 확인 중';
    }
  };

  return (
    <div className="w-64 bg-gray-900 shadow-lg flex flex-col">
      {/* Logo and Title */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">넷시큐어</h1>
            <p className="text-gray-400 text-sm">다중 지침서 분석기</p>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${getServiceStatusColor()}`}></div>
          <span className="text-sm text-gray-300">{getServiceStatusText()}</span>
        </div>
      </div>

      {/* Engine Info */}
      {engineInfo && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">분석 엔진</div>
            <div className="text-sm text-white font-medium mb-1">
              {engineInfo.engineVersion}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{engineInfo.implementedFrameworks?.length || 0}개 지침서</span>
              <span>•</span>
              <span>v{engineInfo.version}</span>
            </div>
            
            {/* Feature Indicators */}
            <div className="mt-2 flex flex-wrap gap-1">
              {engineInfo.features?.multiFrameworkSupport && (
                <span className="px-2 py-0.5 text-xs bg-blue-600 text-blue-100 rounded-full">
                  다중 지침서
                </span>
              )}
              {engineInfo.features?.frameworkComparison && (
                <span className="px-2 py-0.5 text-xs bg-green-600 text-green-100 rounded-full">
                  비교 분석
                </span>
              )}
              {engineInfo.features?.logicalAnalysis && (
                <span className="px-2 py-0.5 text-xs bg-purple-600 text-purple-100 rounded-full">
                  논리 분석
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Menu */}
      <nav className="flex-1">
        <div className="px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-3 mb-1 text-left transition-all duration-200 rounded-lg group ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className={`mr-3 transition-transform duration-200 ${
                activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                {item.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className={`text-xs mt-0.5 ${
                  activeTab === item.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              {activeTab === item.id && (
                <div className="w-1 h-8 bg-blue-300 rounded-full ml-2"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">빠른 통계</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">
              {engineInfo?.supportedFrameworks?.length || 4}
            </div>
            <div className="text-xs text-gray-400">지원 지침서</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">
              {engineInfo?.implementedFrameworks?.length || 3}
            </div>
            <div className="text-xs text-gray-400">구현 완료</div>
          </div>
        </div>
        <div className="mt-2 bg-gray-800 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-white">
            {engineInfo?.frameworkStats?.totalRules || 91}
          </div>
          <div className="text-xs text-gray-400">총 보안 룰</div>
        </div>
      </div>

      {/* Framework Status */}
      {engineInfo && engineInfo.supportedFrameworks && (
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">지침서 현황</div>
          <div className="space-y-1">
            {['KISA', 'CIS', 'NW', 'NIST'].map((frameworkId) => {
              const isImplemented = engineInfo.implementedFrameworks?.includes(frameworkId);
              const isSupported = engineInfo.supportedFrameworks?.includes(frameworkId);
              const rules = engineInfo.frameworkDetails?.[frameworkId]?.total_rules || 
                           engineInfo.frameworkStats?.byFramework?.[frameworkId] || 
                           (frameworkId === 'KISA' ? 38 : frameworkId === 'CIS' ? 11 : frameworkId === 'NW' ? 42 : 0);
              
              return (
                <div key={frameworkId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-300">{frameworkId}</span>
                    {rules > 0 && (
                      <span className="text-xs text-gray-500">({rules})</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isImplemented ? (
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    ) : isSupported ? (
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    )}
                    {frameworkId === 'NW' && isImplemented && (
                      <span className="px-1 py-0.5 text-xs bg-green-600 text-green-100 rounded">NEW</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>활성</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span>예정</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span>계획</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Devices */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">지원 장비</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Cisco</span>
            <span className="text-xs text-blue-400">91룰</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Piolink</span>
            <span className="text-xs text-blue-400">65룰</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Juniper</span>
            <span className="text-xs text-blue-400">60룰</span>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            +7개 장비 지원
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="p-6 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">관</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">관리자</p>
              <p className="text-gray-400 text-xs">보안 분석가</p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">접속 시간</span>
              <span className="text-gray-300">
                {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">세션 상태</span>
              <span className="text-green-400">활성</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">분석 모드</span>
              <span className="text-purple-400">다중 지침서</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="text-center">
          <div className="text-xs text-gray-500">
            Powered by Multi-Framework Engine
          </div>
          <div className="text-xs text-gray-600 mt-1">
            © 2025 NetSecure v2.0
          </div>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="inline-flex px-2 py-0.5 text-xs bg-blue-600 text-blue-100 rounded-full">
              KISA
            </span>
            <span className="inline-flex px-2 py-0.5 text-xs bg-orange-600 text-orange-100 rounded-full">
              CIS
            </span>
            <span className="inline-flex px-2 py-0.5 text-xs bg-green-600 text-green-100 rounded-full">
              NW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;