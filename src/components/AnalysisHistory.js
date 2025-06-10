import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import analysisService from '../services/analysisService';

const AnalysisHistory = ({ user, onSelectAnalysis, onRecordCountChange }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState('recent'); // 'recent', 'stats'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filterFramework, setFilterFramework] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'vulnerabilities', 'score'
  const [expandedVulnerabilities, setExpandedVulnerabilities] = useState({});

  // 실제 저장된 기록 수 계산
  const actualRecordCount = analyses.length;

  useEffect(() => {
    if (user?.uid) {
      loadAnalyses();
      loadStats();
    }
  }, [user?.uid]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const result = await authService.getUserAnalyses(user.uid, 50);
      if (result.success) {
        setAnalyses(result.analyses);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
      setError('분석 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await authService.getUserAnalyticsStats(user.uid);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDeleteAnalysis = async analysisId => {
    try {
      const result = await authService.deleteAnalysis(user.uid, analysisId);
      if (result.success) {
        const updatedAnalyses = analyses.filter(analysis => analysis.id !== analysisId);
        setAnalyses(updatedAnalyses);
        setShowDeleteConfirm(null);
        
        // 새로 추가: 상위 컴포넌트에 기록 수 변경 알림
        if (onRecordCountChange) {
          onRecordCountChange(updatedAnalyses.length);
        }
        
        // 통계 새로고침
        loadStats();
      } else {
        alert('삭제에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getFrameworkInfo = frameworkId => {
    return analysisService.getFrameworkInfo(frameworkId);
  };

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = severity => {
    const colors = {
      Critical: 'bg-red-100 text-red-800',
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-blue-100 text-blue-800',
      상: 'bg-red-100 text-red-800',
      중: 'bg-yellow-100 text-yellow-800',
      하: 'bg-blue-100 text-blue-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  // 필터링 및 정렬된 분석 결과
  const filteredAndSortedAnalyses = analyses
    .filter(analysis => {
      if (filterFramework === 'all') return true;
      return analysis.framework === filterFramework;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'vulnerabilities':
          return (
            (b.summary?.vulnerabilities || 0) -
            (a.summary?.vulnerabilities || 0)
          );
        case 'score':
          return (
            (b.summary?.securityScore || 0) - (a.summary?.securityScore || 0)
          );
        case 'date':
        default:
          const aTime = a.timestamp?.toDate
            ? a.timestamp.toDate()
            : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate
            ? b.timestamp.toDate()
            : new Date(b.timestamp);
          return bTime - aTime;
      }
    });

  // 고유 지침서 목록 (필터용)
  const uniqueFrameworks = [...new Set(analyses.map(a => a.framework))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">분석 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-4"
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadAnalyses}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">분석 기록</h1>
        <p className="text-gray-600">
          지금까지 수행한 보안 분석 결과를 확인하고 관리하세요
          {/* 수정: 실제 저장된 기록 수와 총 분석 횟수를 구분하여 표시 */}
          <span className="text-sm text-gray-500 ml-2">
            (저장된 기록: {actualRecordCount}개 | 총 분석: {user.analysisCount || 0}회)
          </span>
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('recent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'recent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            최근 분석 ({actualRecordCount})
          </button>
          <button
            onClick={() => setSelectedTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            통계
          </button>
        </nav>
      </div>

      {selectedTab === 'recent' && (
        <>
          {/* 필터 및 정렬 옵션 */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지침서 필터
              </label>
              <select
                value={filterFramework}
                onChange={e => setFilterFramework(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                {uniqueFrameworks.map(framework => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                정렬 기준
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">날짜순</option>
                <option value="vulnerabilities">취약점 수</option>
                <option value="score">보안 점수</option>
              </select>
            </div>
            <div className="flex-1 flex items-end">
              <button
                onClick={loadAnalyses}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                새로고침
              </button>
            </div>
          </div>

          {/* 저장된 기록 개수 요약 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-blue-500"
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
              <div>
                <p className="text-sm font-medium text-blue-900">
                  총 {actualRecordCount}개의 분석 기록이 저장되어 있습니다
                </p>
                <p className="text-xs text-blue-700">
                  누적 분석 횟수: {user.analysisCount || 0}회 
                  {(user.analysisCount || 0) > actualRecordCount && 
                    ` (${(user.analysisCount || 0) - actualRecordCount}개 기록 삭제됨)`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 분석 기록 목록 */}
          {filteredAndSortedAnalyses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterFramework === 'all' 
                  ? '분석 기록이 없습니다' 
                  : `${filterFramework} 지침서 분석 기록이 없습니다`
                }
              </h3>
              <p className="text-gray-500 mb-4">
                첫 번째 보안 분석을 시작해보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedAnalyses.map(analysis => {
              const frameworkInfo = getFrameworkInfo(analysis.framework);
              const securityScore =
                analysis.summary?.securityScore ||
                Math.round(
                  (((analysis.summary?.totalChecks || 1) -
                    (analysis.summary?.vulnerabilities || 0)) /
                    (analysis.summary?.totalChecks || 1)) *
                    100
                );

              const isVulnerabilitiesExpanded = expandedVulnerabilities[analysis.id];
              const hasVulnerabilities = analysis.vulnerabilities && analysis.vulnerabilities.length > 0;
              const vulnerabilitiesCount = analysis.vulnerabilities?.length || 0;

              return (
                <div
                  key={analysis.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {frameworkInfo && (
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: frameworkInfo.color }}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {analysis.framework} 분석
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(analysis.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* 상세보기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('상세보기 버튼 클릭:', analysis.id);
                          onSelectAnalysis(analysis);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                        title="상세 분석 결과 보기"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>상세보기</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(analysis.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="삭제"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">장비 타입</div>
                      <div className="font-medium">{analysis.deviceType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">파일명</div>
                      <div
                        className="font-medium truncate"
                        title={analysis.fileName}
                      >
                        {analysis.fileName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        발견된 취약점
                      </div>
                      <div className="font-medium text-red-600">
                        {analysis.summary?.vulnerabilities || 0}개
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">보안 점수</div>
                      <div
                        className={`font-medium ${securityScore >= 80 ? 'text-green-600' : securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {securityScore}점
                      </div>
                    </div>
                  </div>

                  {/* 취약점 요약 */}
                  {analysis.summary && (
                    <div className="flex items-center space-x-4 mb-4">
                      {analysis.summary.highSeverity > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          고위험 {analysis.summary.highSeverity}개
                        </span>
                      )}
                      {analysis.summary.mediumSeverity > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          중위험 {analysis.summary.mediumSeverity}개
                        </span>
                      )}
                      {analysis.summary.lowSeverity > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          저위험 {analysis.summary.lowSeverity}개
                        </span>
                      )}
                      {analysis.isComparison && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          비교 분석
                        </span>
                      )}
                    </div>
                  )}

                  {/* 취약점 목록 섹션 */}
                  {hasVulnerabilities && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {isVulnerabilitiesExpanded ? 
                            `모든 취약점 (${vulnerabilitiesCount}개)` : 
                            `주요 취약점 (상위 ${Math.min(3, vulnerabilitiesCount)}개)`
                          }
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                          onClick={(e) => {
                          e.preventDefault();
                          setExpandedVulnerabilities(prev => ({
                          ...prev,
                          [analysis.id]: !prev[analysis.id]
                          }));
                          }}
                          className="inline-flex items-center px-3 py-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                          >
                          <span className="mr-1">
                          {isVulnerabilitiesExpanded ? 
                          '간단히 보기' : 
                          `전체 ${vulnerabilitiesCount}개 보기`
                          }
                          </span>
                          <svg
                          className={`w-3 h-3 transition-transform duration-200 ${
                          isVulnerabilitiesExpanded ? 'rotate-180' : ''
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
                        </div>
                      </div>
                      
                      {/* 취약점 목록 - 긴 텍스트 처리 개선 */}
                      <div className="space-y-3">
                        {(isVulnerabilitiesExpanded ? 
                          analysis.vulnerabilities : 
                          analysis.vulnerabilities.slice(0, 3)
                        ).map((vuln, index) => (
                          <div key={index} className={`p-4 bg-gray-50 rounded-lg ${
                            isVulnerabilitiesExpanded ? 'space-y-3' : ''
                          }`}>
                            {/* 첫 번째 줄: 심각도와 설명 */}
                            <div className="flex items-start space-x-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getSeverityColor(vuln.severity)}`}
                              >
                                {vuln.severity}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm text-gray-900 ${
                                  isVulnerabilitiesExpanded ? 'whitespace-normal break-words' : 'truncate'
                                }`}>
                                  {vuln.description}
                                </p>
                              </div>
                            </div>
                            
                            {/* 두 번째 줄: 추가 정보 (전체 보기일 때만) */}
                            {isVulnerabilitiesExpanded && (
                              <div className="space-y-2">
                                {vuln.recommendation && (
                                  <div className="pl-3 border-l-2 border-blue-200">
                                    <p className="text-xs text-gray-600 break-words">
                                      <span className="font-medium text-blue-700">권장사항:</span> {vuln.recommendation}
                                    </p>
                                  </div>
                                )}
                                
                                {/* 메타 정보 */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {vuln.ruleId && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-white text-gray-600 rounded border">
                                      룰 ID: {vuln.ruleId}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-white text-gray-600 rounded border">
                                    {typeof vuln.line === 'number' && vuln.line > 0
                                      ? `라인 ${vuln.line}`
                                      : '라인 정보 없음'}
                                  </span>
                                  {vuln.impact && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                                      영향: {vuln.impact}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* 간단 보기일 때 메타 정보 */}
                            {!isVulnerabilitiesExpanded && (
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  {vuln.ruleId && (
                                    <span className="text-xs text-gray-500">
                                      {vuln.ruleId}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {typeof vuln.line === 'number' && vuln.line > 0
                                    ? `라인 ${vuln.line}`
                                    : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 확장된 상태에서 요약 정보 - 개선된 레이아웃 */}
                      {isVulnerabilitiesExpanded && vulnerabilitiesCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-25 rounded-lg p-3">
                          <div className="space-y-3">
                            {/* 심각도별 통계 */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                <div className="text-lg font-bold text-red-700">
                                  {analysis.summary?.highSeverity || 0}
                                </div>
                                <div className="text-xs text-red-600">고위험</div>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                <div className="text-lg font-bold text-yellow-700">
                                  {analysis.summary?.mediumSeverity || 0}
                                </div>
                                <div className="text-xs text-yellow-600">중위험</div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="text-lg font-bold text-blue-700">
                                  {analysis.summary?.lowSeverity || 0}
                                </div>
                                <div className="text-xs text-blue-600">저위험</div>
                              </div>
                            </div>
                            
                            {/* 액션 버튼 */}
                            <div className="text-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  onSelectAnalysis(analysis);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                전체 분석 결과 보기
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 취약점이 없는 경우 */}
                  {!hasVulnerabilities && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-600 font-medium">
                          ✅ 취약점이 발견되지 않았습니다
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectAnalysis(analysis);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          상세 분석 결과 보기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </>
      )}

      {selectedTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* 전체 통계 카드 - 수정: 실제 기록 수와 총 분석 수를 구분 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    저장된 기록 수
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {actualRecordCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    총 분석: {user.analysisCount || 0}회
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 취약점</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.totalVulnerabilities}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    평균 보안 점수
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.averageSecurityScore}점
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">최근 30일</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.monthlyAnalyses}회
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 지침서 사용 통계 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              지침서별 사용 통계 (저장된 기록 기준)
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.frameworkUsage).map(
                ([framework, count]) => {
                  const frameworkInfo = getFrameworkInfo(framework);
                  const percentage = actualRecordCount > 0 
                    ? Math.round((count / actualRecordCount) * 100) 
                    : 0;

                  return (
                    <div
                      key={framework}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {frameworkInfo && (
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: frameworkInfo.color }}
                          />
                        )}
                        <span className="font-medium">{framework}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor:
                                frameworkInfo?.color || '#6B7280',
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}회 ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* 장비 타입 사용 통계 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              장비 타입별 사용 통계 (저장된 기록 기준)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.deviceTypeUsage).map(
                ([deviceType, count]) => {
                  const percentage = actualRecordCount > 0 
                    ? Math.round((count / actualRecordCount) * 100) 
                    : 0;

                  return (
                    <div
                      key={deviceType}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">{deviceType}</span>
                      <span className="text-sm text-gray-600">
                        {count}회 ({percentage}%)
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* 최근 활동 */}
          {stats.lastAnalysisDate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                최근 활동
              </h3>
              <p className="text-gray-600">
                마지막 분석:{' '}
                {stats.lastAnalysisDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              분석 기록 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              이 분석 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.
              <br />
              <span className="text-sm text-gray-500">
                (참고: 총 분석 횟수는 변경되지 않습니다)
              </span>
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteAnalysis(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;