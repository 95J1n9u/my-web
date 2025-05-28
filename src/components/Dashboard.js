import React from 'react';

const Dashboard = ({ analysisResults, serviceStatus, onNavigateToUpload, onNavigateToResults }) => {
  // 실제 분석 결과가 있으면 해당 데이터 사용, 없으면 기본값 사용
  const stats = [
    {
      title: '총 스캔 수',
      value: analysisResults ? '1' : '0',
      change: analysisResults ? 'New!' : '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-blue-500'
    },
    {
      title: '고위험 취약점',
      value: analysisResults ? (analysisResults.summary.highSeverity || 0).toString() : '0',
      change: analysisResults ? 'New!' : '0%',
      changeType: analysisResults && analysisResults.summary.highSeverity > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-red-500'
    },
    {
      title: '중위험 취약점',
      value: analysisResults ? (analysisResults.summary.mediumSeverity || 0).toString() : '0',
      change: analysisResults ? 'New!' : '0%',
      changeType: analysisResults && analysisResults.summary.mediumSeverity > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-500'
    },
    {
      title: '통과한 항목',
      value: analysisResults ? analysisResults.summary.passed.toString() : '0',
      change: analysisResults ? 'New!' : '0%',
      changeType: analysisResults && analysisResults.summary.passed > 0 ? 'increase' : 'neutral',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-500'
    }
  ];

  // 최근 분석 데이터 (실제 결과가 있으면 표시)
  const recentScans = analysisResults ? [
    {
      id: 1,
      device: analysisResults.metadata?.deviceType || 'Unknown Device',
      ip: 'Uploaded Config',
      date: new Date(analysisResults.metadata?.timestamp || Date.now()).toLocaleDateString('ko-KR'),
      status: '완료',
      issues: analysisResults.summary?.vulnerabilities || 0,
      severity: analysisResults.summary?.highSeverity > 0 ? '고위험' : 
                analysisResults.summary?.mediumSeverity > 0 ? '중위험' : '저위험'
    }
  ] : [
    {
      id: 1,
      device: '분석 대기 중',
      ip: '-',
      date: '-',
      status: '대기',
      issues: 0,
      severity: 'N/A'
    }
  ];

  const getSecurityScore = () => {
    if (!analysisResults) return 0;
    const { totalChecks, vulnerabilities } = analysisResults.summary;
    if (totalChecks === 0) return 0;
    return Math.round(((totalChecks - vulnerabilities) / totalChecks) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">KISA 네트워크 보안 분석 현황 개요</p>
      </div>

      {/* Service Status Alert */}
      {serviceStatus === 'offline' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">서비스 연결 오류</p>
              <p className="text-sm text-red-700">분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-red-600' : 
                    stat.changeType === 'decrease' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {analysisResults ? '최근 분석' : '분석 대기'}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Score and Analysis Summary */}
      {analysisResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 점수</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900">{getSecurityScore()}점</div>
              <div className="text-sm text-gray-500">100점 만점</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                총 {analysisResults.summary.totalChecks}개 항목 중
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">{analysisResults.summary.passed}개 통과</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-red-600 font-medium">{analysisResults.summary.vulnerabilities}개 취약점</span>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getSecurityScore()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">최근 분석</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    장비
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    취약점
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{scan.device}</div>
                        <div className="text-sm text-gray-500">{scan.ip}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        scan.status === '완료' 
                          ? 'bg-green-100 text-green-800' 
                          : scan.status === '대기'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{scan.issues}</span>
                        {scan.severity !== 'N/A' && (
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            scan.severity === '고위험' 
                              ? 'bg-red-100 text-red-800' 
                              : scan.severity === '중위험'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {scan.severity}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">빠른 작업</h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={onNavigateToUpload}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={serviceStatus === 'offline'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              새 설정 파일 분석
            </button>
            
            <button 
              onClick={onNavigateToResults}
              disabled={!analysisResults}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              분석 결과 보기
            </button>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>KISA 네트워크 보안 가이드 기반</p>
                <p className="font-medium text-blue-600">38개 보안 룰셋 자동 검사</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Guide */}
      {!analysisResults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-medium text-blue-900 mb-2">분석을 시작하세요</h4>
              <p className="text-sm text-blue-700 mb-4">
                네트워크 장비의 설정 파일을 업로드하면 KISA 보안 가이드를 기반으로 
                38개 항목의 보안 취약점을 자동으로 분석해드립니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <h5 className="font-medium mb-1">지원 장비:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Cisco IOS/IOS-XE</li>
                    <li>Juniper JunOS</li>
                    <li>Radware Alteon</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">분석 항목:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>패스워드 보안 정책</li>
                    <li>접근 제어 설정</li>
                    <li>로그 및 모니터링</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;