import React, { useState, useEffect } from 'react'; // React import 수정
import analysisService from '../services/analysisService';
import { authService } from '../config/firebase';
import { useAuth } from '../hooks/useAuth'; // 이 줄 추가

const Dashboard = ({
  analysisResults,
  comparisonResults,
  serviceStatus,
  selectedFramework,
  frameworks,
  engineInfo,
  onNavigateToUpload,
  onNavigateToResults,
  user,
  onLogin,
  onNavigateToAdmin,
}) => {
  
  // useAuth 훅 추가
  const { isAdmin, userRole, hasPermission } = useAuth(user);

  // 누적 통계 상태 추가
  const [cumulativeStats, setCumulativeStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // 사용자가 변경되거나 로그인할 때 누적 통계 로드
  useEffect(() => {
    if (user?.uid) {
      loadCumulativeStats();
    } else {
      setCumulativeStats(null);
    }
  }, [user?.uid]);

  // 누적 통계 로드 함수
  const loadCumulativeStats = async () => {
    if (!user?.uid) return;

    try {
      setLoadingStats(true);
      
      // 사용자의 분석 기록 가져오기
      const analysesResult = await authService.getUserAnalyses(user.uid, 100); // 최대 100개
      
      if (analysesResult.success) {
        const analyses = analysesResult.analyses;
        
        // 누적 통계 계산
        const stats = {
          totalScans: analyses.length,
          totalVulnerabilities: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0,
          totalPassed: 0,
          totalChecks: 0,
        };

        analyses.forEach(analysis => {
          if (analysis.summary) {
            stats.totalVulnerabilities += analysis.summary.vulnerabilities || 0;
            stats.highSeverity += analysis.summary.highSeverity || 0;
            stats.mediumSeverity += analysis.summary.mediumSeverity || 0;
            stats.lowSeverity += analysis.summary.lowSeverity || 0;
            stats.totalPassed += analysis.summary.passed || 0;
            stats.totalChecks += analysis.summary.totalChecks || 0;
          }
        });

        setCumulativeStats(stats);
      }
    } catch (error) {
      console.error('Failed to load cumulative stats:', error);
      setCumulativeStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // 실제 분석 결과가 있으면 해당 데이터 사용, 없으면 기본값 사용
  const hasResults = analysisResults || comparisonResults;
  const getFrameworkInfo = frameworkId =>
    analysisService.getFrameworkInfo(frameworkId);

  // 비교 분석 결과 요약
  const getComparisonSummary = () => {
    if (!comparisonResults) return null;

    const successfulResults = Object.values(
      comparisonResults.frameworks
    ).filter(result => !result.error);

    return {
      totalFrameworks: Object.keys(comparisonResults.frameworks).length,
      successfulAnalyses: successfulResults.length,
      totalIssues: successfulResults.reduce(
        (sum, result) => sum + (result.summary?.vulnerabilities || 0),
        0
      ),
      averageScore:
        successfulResults.length > 0
          ? Math.round(
              successfulResults.reduce(
                (sum, result) =>
                  sum +
                  ((result.summary?.passed || 0) /
                    (result.summary?.totalChecks || 1)) *
                    100,
                0
              ) / successfulResults.length
            )
          : 0,
    };
  };

  const comparisonSummary = getComparisonSummary();

  // 현재 분석 결과의 통계
  const currentAnalysisStats = {
    vulnerabilities: comparisonSummary
      ? Object.values(comparisonResults.frameworks)
          .filter(r => !r.error)
          .reduce((sum, r) => sum + (r.summary?.vulnerabilities || 0), 0)
      : analysisResults?.summary?.vulnerabilities || 0,
    highSeverity: comparisonSummary
      ? Object.values(comparisonResults.frameworks)
          .filter(r => !r.error)
          .reduce((sum, r) => sum + (r.summary?.highSeverity || 0), 0)
      : analysisResults?.summary?.highSeverity || 0,
    mediumSeverity: comparisonSummary
      ? Object.values(comparisonResults.frameworks)
          .filter(r => !r.error)
          .reduce((sum, r) => sum + (r.summary?.mediumSeverity || 0), 0)
      : analysisResults?.summary?.mediumSeverity || 0,
    passed: comparisonSummary
      ? Object.values(comparisonResults.frameworks)
          .filter(r => !r.error)
          .reduce((sum, r) => sum + (r.summary?.passed || 0), 0)
      : analysisResults?.summary?.passed || 0,
  };

  // 최종 표시할 통계 (누적 통계 + 현재 분석)
  const getDisplayStats = () => {
    if (user && cumulativeStats) {
      // 로그인한 사용자: 누적 통계 표시
      return {
        totalScans: cumulativeStats.totalScans,
        vulnerabilities: cumulativeStats.totalVulnerabilities,
        highSeverity: cumulativeStats.highSeverity,
        mediumSeverity: cumulativeStats.mediumSeverity,
        passed: cumulativeStats.totalPassed,
      };
    } else {
      // 비로그인 사용자: 현재 분석 결과만 표시
      return {
        totalScans: hasResults ? 1 : 0,
        vulnerabilities: currentAnalysisStats.vulnerabilities,
        highSeverity: currentAnalysisStats.highSeverity,
        mediumSeverity: currentAnalysisStats.mediumSeverity,
        passed: currentAnalysisStats.passed,
      };
    }
  };

  const displayStats = getDisplayStats();

  const stats = [
    {
      title: '총 스캔 수',
      value: loadingStats ? '...' : displayStats.totalScans.toString(),
      change: user && cumulativeStats 
        ? `총 ${displayStats.totalScans}회 분석`
        : hasResults ? 'New!' : '+0%',
      changeType: 'neutral',
      icon: (
        <svg
          className="w-8 h-8"
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
      bgColor: 'bg-blue-500',
    },
    {
      title: '고위험 취약점',
      value: loadingStats ? '...' : displayStats.highSeverity.toString(),
      change: user && cumulativeStats
        ? `누적 ${displayStats.highSeverity}개`
        : hasResults ? 'New!' : '0%',
      changeType: displayStats.highSeverity > 0 ? 'increase' : 'neutral',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      bgColor: 'bg-red-500',
    },
    {
      title: '중위험 취약점',
      value: loadingStats ? '...' : displayStats.mediumSeverity.toString(),
      change: user && cumulativeStats
        ? `누적 ${displayStats.mediumSeverity}개`
        : hasResults ? 'New!' : '0%',
      changeType: displayStats.mediumSeverity > 0 ? 'increase' : 'neutral',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-yellow-500',
    },
    {
      title: '통과한 항목',
      value: loadingStats ? '...' : displayStats.passed.toString(),
      change: user && cumulativeStats
        ? `누적 ${displayStats.passed}개`
        : hasResults ? 'New!' : '0%',
      changeType: 'neutral',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-green-500',
    },
  ];

  // 최근 분석 데이터
  const recentScans = hasResults
    ? [
        {
          id: 1,
          device: analysisResults?.metadata?.deviceType || 'Multiple Devices',
          framework: comparisonSummary
            ? `${comparisonSummary.totalFrameworks}개 지침서`
            : analysisResults?.metadata?.framework || selectedFramework,
          date: new Date(
            analysisResults?.metadata?.timestamp ||
              comparisonResults?.metadata?.timestamp ||
              Date.now()
          ).toLocaleDateString('ko-KR'),
          status: '완료',
          issues: comparisonSummary
            ? comparisonSummary.totalIssues
            : analysisResults?.summary?.vulnerabilities || 0,
          severity:
            comparisonSummary || analysisResults?.summary
              ? comparisonSummary
                ? comparisonSummary.totalIssues > 0
                  ? '다중 지침서'
                  : '안전'
                : analysisResults.summary.highSeverity > 0
                  ? '고위험'
                  : analysisResults.summary.mediumSeverity > 0
                    ? '중위험'
                    : '저위험'
              : 'N/A',
        },
      ]
    : [
        {
          id: 1,
          device: '분석 대기 중',
          framework: '-',
          date: '-',
          status: '대기',
          issues: 0,
          severity: 'N/A',
        },
      ];

  const getSecurityScore = () => {
    if (comparisonSummary) {
      return comparisonSummary.averageScore;
    }
    if (!analysisResults) return 0;
    const { totalChecks, vulnerabilities } = analysisResults.summary;
    if (totalChecks === 0) return 0;
    return Math.round(((totalChecks - vulnerabilities) / totalChecks) * 100);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">
          다중 보안 지침서 기반 네트워크 보안 분석 현황 개요
          {engineInfo && (
            <span className="text-sm text-gray-500 ml-2">
              (Engine: {engineInfo.engineVersion})
            </span>
          )}
        </p>
      </div>


      {/* Service Status Alert */}
      {serviceStatus === 'offline' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">
                서비스 연결 오류
              </p>
              <p className="text-sm text-red-700">
                분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Framework Status */}
      {engineInfo && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            지원 보안 지침서 현황
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engineInfo.supportedFrameworks?.length || 0}
              </div>
              <div className="text-sm text-gray-600">지원 지침서</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {engineInfo.implementedFrameworks?.length || 0}
              </div>
              <div className="text-sm text-gray-600">구현 완료</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(engineInfo.supportedFrameworks?.length || 0) -
                  (engineInfo.implementedFrameworks?.length || 0)}
              </div>
              <div className="text-sm text-gray-600">구현 예정</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {engineInfo.supportedFrameworks?.map(frameworkId => {
              const isImplemented =
                engineInfo.implementedFrameworks?.includes(frameworkId);
              const info = getFrameworkInfo(frameworkId);
              return (
                <span
                  key={frameworkId}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                    isImplemented
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {info && (
                    <span
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: info.color }}
                    />
                  )}
                  {frameworkId}
                  {info?.totalRules && ` (${info.totalRules}룰)`}
                  {!isImplemented && ' (예정)'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase'
                        ? 'text-red-600'
                        : stat.changeType === 'decrease'
                          ? 'text-green-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {hasResults ? '최근 분석' : ''}
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
      {hasResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {comparisonSummary ? '종합 보안 점수' : '보안 점수'}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900">
                {getSecurityScore()}점
              </div>
              <div className="text-sm text-gray-500">
                {comparisonSummary
                  ? `${comparisonSummary.totalFrameworks}개 지침서 평균`
                  : '100점 만점'}
              </div>
            </div>
            <div className="text-right">
              {comparisonSummary ? (
                <div>
                  <div className="text-sm text-gray-600">
                    {comparisonSummary.successfulAnalyses}개 지침서 분석 완료
                  </div>
                  <div className="text-sm">
                    <span className="text-red-600 font-medium">
                      총 {comparisonSummary.totalIssues}개 취약점 발견
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-600">
                    총 {analysisResults.summary.totalChecks}개 항목 중
                  </div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {analysisResults.summary.passed}개 통과
                    </span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-red-600 font-medium">
                      {analysisResults.summary.vulnerabilities}개 취약점
                    </span>
                  </div>
                </div>
              )}
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
                    장비/지침서
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
                {recentScans.map(scan => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {scan.device}
                        </div>
                        <div className="text-sm text-gray-500">
                          {scan.framework}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scan.status === '완료'
                            ? 'bg-green-100 text-green-800'
                            : scan.status === '대기'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {scan.issues}
                        </span>
                        {scan.severity !== 'N/A' && (
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              scan.severity === '고위험'
                                ? 'bg-red-100 text-red-800'
                                : scan.severity === '중위험'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : scan.severity === '다중 지침서'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                          >
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
              <svg
                className="w-5 h-5 mr-2"
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
              새 설정 파일 분석
            </button>

            <button
              onClick={onNavigateToResults}
              disabled={!hasResults}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              분석 결과 보기
            </button>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <p>다중 보안 지침서 기반 분석</p>
                <p className="font-medium text-blue-600">
                  {frameworks.filter(f => f.isImplemented).length}개 지침서 구현
                  완료
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  KISA ({getFrameworkInfo('KISA')?.totalRules}룰) • CIS (
                  {getFrameworkInfo('CIS')?.totalRules}룰) • NW (
                  {getFrameworkInfo('NW')?.totalRules}룰)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Frameworks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          사용 가능한 보안 지침서
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map(framework => {
            const info = getFrameworkInfo(framework.id);
            return (
              <div
                key={framework.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  framework.isImplemented
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {info && (
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {framework.id}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      framework.isImplemented
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {framework.isImplemented ? '사용 가능' : '구현 예정'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {framework.description}
                </p>
                {framework.total_rules && (
                  <p className="text-xs text-gray-500">
                    {framework.total_rules}개 보안 룰셋
                  </p>
                )}
                {info && (
                  <p className="text-xs text-gray-500">
                    {info.organization} • {info.country}
                  </p>
                )}

                {/* Framework specific features */}
                {framework.id === 'KISA' && (
                  <div className="mt-2 text-xs text-blue-600">
                    ✓ 국내 기준 준수(21년)
                  </div>
                )}
                {framework.id === 'CIS' && (
                  <div className="mt-2 text-xs text-orange-600">
                    ✓ 구체적인 설정 • 실무적 보안
                  </div>
                )}
                {framework.id === 'NW' && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ 강화된 점검 • 최신 기준(25년)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Framework Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          지침서별 비교
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지침서
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 룰
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  중급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  하급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  특징
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    <span className="text-sm font-medium text-gray-900">
                      KISA
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  38개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  14개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  19개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  5개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  한국 표준, 종합적
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                    <span className="text-sm font-medium text-gray-900">
                      CIS
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  89개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  6개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  5개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  0개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  AAA 중심, 상세함
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm font-medium text-gray-900">
                      NW
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  42개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  8개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                  30개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  4개
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  물리보안 강화
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Guide */}
      {!hasResults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-500 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-lg font-medium text-blue-900 mb-2">
                다중 지침서 분석을 시작하세요
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                다양한 보안 지침서(KISA, CIS, NW 등)를 선택하여 네트워크 장비
                설정 파일을 종합적으로 분석할 수 있습니다. 단일 지침서 분석 또는
                여러 지침서 비교 분석이 가능합니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <h5 className="font-medium mb-1">지원 지침서:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>KISA (한국인터넷진흥원) ✅ 38룰</li>
                    <li>CIS (Center for Internet Security) ✅ 89룰</li>
                    <li>NW (네트워크 보안 지침서) ✅ 42룰</li>
                    <li>NIST (National Institute of Standards) 🚧 계획중</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-1">분석 기능:</h5>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>단일 지침서 상세 분석</li>
                    <li>다중 지침서 비교 분석</li>
                    <li>논리 기반 취약점 탐지</li>
                    <li>지침서별 맞춤 권고사항</li>
                    <li>10개 브랜드 장비 지원</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      )}
      {/* 권한 디버깅 섹션 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-4">
            권한 디버깅 (개발용)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>사용자 정보:</strong>
              <div className="mt-2 space-y-1">
                <div>UID: <code className="bg-yellow-100 px-1 rounded">{user.uid}</code></div>
                <div>Role: <code className="bg-yellow-100 px-1 rounded">{user.role || 'undefined'}</code></div>
                <div>Email: <code className="bg-yellow-100 px-1 rounded">{user.email}</code></div>
                <div>DisplayName: <code className="bg-yellow-100 px-1 rounded">{user.displayName || 'N/A'}</code></div>
                <div>Analysis Count: <code className="bg-yellow-100 px-1 rounded">{user.analysisCount || 0}</code></div>
              </div>
            </div>
            <div>
              <strong>권한 체크:</strong>
              <div className="mt-2 space-y-1">
                <div>useAuth isAdmin(): <span className={`font-medium ${isAdmin() ? 'text-red-600' : 'text-blue-600'}`}>{isAdmin() ? 'Yes' : 'No'}</span></div>
                <div>useAuth userRole: <code className="bg-yellow-100 px-1 rounded">{userRole || 'undefined'}</code></div>
                <div>직접 user.role: <code className="bg-yellow-100 px-1 rounded">{user.role || 'undefined'}</code></div>
                <div>isAuthenticated: <span className="font-medium text-green-600">{user ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => console.log('User object:', user)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Console Log User
            </button>
            <button
              onClick={() => {
                console.log('Auth Hook Result:', { isAdmin: isAdmin(), userRole, user: user });
              }}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            >
              Log Auth Hook
            </button>
              <button
    onClick={() => {
      if (onNavigateToAdmin && isAdmin()) {
        console.log('Navigating to admin panel...');
        onNavigateToAdmin();
      }
    }}
    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
    disabled={!isAdmin()}
  >
    {isAdmin() ? '관리자 패널로 이동' : '관리자 권한 없음'}
  </button>
            <button
              onClick={() => {
                alert(`현재 권한: ${userRole || 'undefined'}\n관리자 여부: ${isAdmin() ? 'Yes' : 'No'}`);
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              권한 Alert
            </button>
          </div>
          <div className="mt-3 text-xs text-yellow-700">
            이 섹션은 개발 환경에서만 표시됩니다. 프로덕션에서는 자동으로 숨겨집니다.
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;
