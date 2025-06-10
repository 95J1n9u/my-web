import React, { useState } from 'react';
import { sanitizeHtml, sanitizeText } from '../utils/sanitizer';

const AIRemediation = ({ aiResults, isLoading, onClose, onRetry }) => {
  const [expandedFixes, setExpandedFixes] = useState({});
  const [showCompleteConfig, setShowCompleteConfig] = useState(false);
  const [selectedTab, setSelectedTab] = useState('fixes'); // 'fixes', 'config', 'recommendations'

  const toggleFixExpansion = (fixId) => {
    setExpandedFixes(prev => ({
      ...prev,
      [fixId]: !prev[fixId]
    }));
  };

  const copySingleFix = (commands) => {
    const commandText = commands.join('\n');
    navigator.clipboard.writeText(commandText);
  };

  const copyAllFixes = () => {
    const allCommands = aiResults.vulnerability_fixes
      .flatMap(fix => fix.fix_commands)
      .join('\n');
    navigator.clipboard.writeText(allCommands);
  };

  const downloadFixedConfig = () => {
    const blob = new Blob([aiResults.complete_fixed_config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixed-config-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-blue-100 text-blue-800 border-blue-200',
      'Critical': 'bg-red-200 text-red-900 border-red-300'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

 if (isLoading) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI 조치 방안 생성 중</h3>
          
          {/* 🔥 비동기/스트리밍 진행상황 표시 */}
          {aiResults?.isAsync ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enterprise 배치 처리로 {aiResults.vulnerability_count}개 취약점을 분석하고 있습니다
              </p>
              <div className="text-xs text-gray-500">
                예상 배치 수: {aiResults.estimated_batches}개
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '30%'}}></div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              인공지능이 맞춤형 보안 조치 방안을 분석하고 있습니다...
            </p>
          )}
          
          <div className="mt-4 text-xs text-gray-500">
            {aiResults?.isAsync ? '평균 처리 시간: 3-8분' : '평균 처리 시간: 3-8분'}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 비동기 작업 결과 처리 (기존 결과 표시 전에 추가)
if (aiResults?.isAsync && !aiResults.analysis_summary && !aiResults.vulnerability_fixes) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enterprise 분석 진행 중</h3>
          <p className="text-sm text-gray-600 mb-4">
            작업 ID: {aiResults.job_id}<br/>
            {aiResults.vulnerability_count}개 취약점을 {aiResults.estimated_batches}개 배치로 처리합니다
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span>상태:</span>
                <span className="font-medium text-blue-600">처리 중</span>
              </div>
              <div className="flex justify-between">
                <span>모니터링:</span>
                <span className="text-green-600">자동 갱신</span>
              </div>
              <div className="flex justify-between">
                <span>예상 완료:</span>
                <span className="text-gray-600">3-8분 후</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              백그라운드로 실행
            </button>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              새로고침
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            💡 백그라운드로 실행하면 분석이 완료될 때까지 다른 작업을 할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
  // 🔥 백그라운드 작업 완료 후 결과가 있는 경우에도 표시
  if (!aiResults || (!aiResults.vulnerability_fixes && !aiResults.analysis_summary && !aiResults.isAsync)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">
            NetSecure AI 조치 방안
            {/* 🔥 모드 표시 추가 */}
            {aiResults?.mode && (
                <span className={`ml-3 inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${
                aiResults.mode === 'Enterprise' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                {aiResults.mode === 'Enterprise' ? '🚀 Enterprise' : '⚡ Standard'}
                </span>
            )}
            {/* 🔥 처리 상태 표시 */}
            {aiResults?.isAsync && !aiResults.vulnerability_fixes && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  ⏳ 처리중
                </span>
            )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
            {aiResults.analysis_summary?.device_type || aiResults.device_type || 'N/A'} • 
            {aiResults.analysis_summary?.security_framework || aiResults.framework || 'N/A'} • 
            {aiResults.analysis_summary?.processed_successfully || aiResults.vulnerability_fixes?.length || 0}/{aiResults.analysis_summary?.total_vulnerabilities || aiResults.vulnerability_count || 0}개 처리
            {/* 🔥 처리 방식 안내 추가 */}
            {aiResults?.mode && (
                <span className="ml-2 text-gray-500">
                ({aiResults.mode === 'Enterprise' ? 'Enterprise 배치 처리' : 'Standard 처리'})
                </span>
            )}
            {/* 🔥 백그라운드 완료 안내 */}
            {aiResults?.isAsync && aiResults.vulnerability_fixes && (
                <span className="ml-2 text-green-600 font-medium">
                ✅ 백그라운드 처리 완료
                </span>
            )}
            </p>
        </div>
        <div className="flex space-x-2">
            <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
            재분석
            </button>
            <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'fixes', name: '조치 방안', count: aiResults.vulnerability_fixes?.length },
              { id: 'config', name: '수정된 설정' },
              { id: 'recommendations', name: '권고사항' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'fixes' && (
            <div className="space-y-6">
              {/* Actions Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  개별 조치 방안 ({aiResults.vulnerability_fixes?.length}개)
                </h3>
                <button
                  onClick={copyAllFixes}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                >
                  모든 명령어 복사
                </button>
              </div>

              {/* Vulnerability Fixes */}
              <div className="space-y-4">
                {aiResults.vulnerability_fixes?.map((fix, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => toggleFixExpansion(fix.vulnerability_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(fix.severity)}`}>
                            {fix.severity}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {fix.rule_id}
                          </span>
                          <h4 className="text-lg font-medium text-gray-900">{sanitizeText(fix.title)}</h4>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedFixes[fix.vulnerability_id] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{sanitizeText(fix.description)}</p>
                    </div>

                    {expandedFixes[fix.vulnerability_id] && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="pt-4 space-y-4">
                          {/* Explanation */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">조치 설명:</h5>
                            <p className="text-sm text-gray-700">{sanitizeText(fix.explanation)}</p>
                          </div>

                          {/* Commands */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-900">실행 명령어:</h5>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copySingleFix(fix.fix_commands);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200"
                              >
                                복사
                              </button>
                            </div>
                            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                              {fix.fix_commands.join('\n')}
                            </pre>
                          </div>

                          {/* Location */}
                          {fix.location && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-1">적용 위치:</h5>
                              <span className="text-sm text-gray-600">{sanitizeText(fix.location)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'config' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">수정된 전체 설정</h3>
                <button
                    onClick={downloadFixedConfig}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                    설정 파일 다운로드
                </button>
                </div>

              {/* Config Differences */}
              {aiResults.config_differences && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {aiResults.config_differences.added_lines?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-2">추가된 설정 ({aiResults.config_differences.added_lines.length}개)</h4>
                      <div className="space-y-1">
                        {aiResults.config_differences.added_lines.slice(0, 3).map((line, index) => (
                          <div key={index} className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            + {sanitizeText(line)}
                          </div>
                        ))}
                        {aiResults.config_differences.added_lines.length > 3 && (
                          <div className="text-xs text-green-600">
                            +{aiResults.config_differences.added_lines.length - 3}개 더...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aiResults.config_differences.modified_lines?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">수정된 설정 ({aiResults.config_differences.modified_lines.length}개)</h4>
                      <div className="space-y-1">
                        {aiResults.config_differences.modified_lines.slice(0, 3).map((line, index) => (
                          <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            ~ {sanitizeText(line)}
                          </div>
                        ))}
                        {aiResults.config_differences.modified_lines.length > 3 && (
                          <div className="text-xs text-yellow-600">
                            +{aiResults.config_differences.modified_lines.length - 3}개 더...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aiResults.config_differences.removed_lines?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-900 mb-2">제거된 설정 ({aiResults.config_differences.removed_lines.length}개)</h4>
                      <div className="space-y-1">
                        {aiResults.config_differences.removed_lines.slice(0, 3).map((line, index) => (
                          <div key={index} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            - {sanitizeText(line)}
                          </div>
                        ))}
                        {aiResults.config_differences.removed_lines.length > 3 && (
                          <div className="text-xs text-red-600">
                            +{aiResults.config_differences.removed_lines.length - 3}개 더...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Complete Config */}
<div className="bg-gray-900 rounded-lg overflow-hidden">
  <div className="flex items-center justify-between p-3 bg-gray-800">
    <span className="text-sm font-medium text-gray-200">수정된 전체 설정 파일</span>
    <button
      onClick={() => {
        if (aiResults.complete_fixed_config && aiResults.complete_fixed_config !== "Enterprise 배치 처리로 인해 생략") {
          navigator.clipboard.writeText(aiResults.complete_fixed_config);
        } else {
          // 개별 fix_commands를 조합하여 설정 생성
          const allCommands = aiResults.vulnerability_fixes
            ?.flatMap(fix => fix.config_lines || fix.fix_commands || [])
            .join('\n') || '';
          navigator.clipboard.writeText(allCommands);
        }
      }}
      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200"
    >
      복사
    </button>
  </div>
  <pre className="text-green-400 p-4 text-sm overflow-x-auto max-h-96">
    {aiResults.complete_fixed_config && 
     aiResults.complete_fixed_config !== "Enterprise 배치 처리로 인해 생략" && 
     aiResults.complete_fixed_config.length > 10 ? (
      // 실제 설정 파일이 있는 경우
      aiResults.complete_fixed_config
    ) : (
      // 설정 파일이 없거나 생략된 경우 개별 조치사항 표시
      <div className="space-y-4">
        <div className="text-yellow-400 mb-4">
          # 수정된 설정 파일 (개별 조치사항 조합)<br />
          # 10개이상 취약점 분석은 전체 config를 제공하지 않습니다.<br />
          # 조치방안은 샘플이니 검증을 거친 후 적용하시기 바랍니다.
        </div>
        {aiResults.vulnerability_fixes?.map((fix, index) => (
          <div key={index} className="border-l-2 border-blue-500 pl-4 mb-4">
            <div className="text-blue-400 text-xs mb-2">
              # {fix.rule_id}: {fix.title}
            </div>
            {(fix.config_lines || fix.fix_commands || []).map((line, lineIndex) => (
              <div key={lineIndex} className="text-green-400">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    )}
  </pre>
</div>
            </div>
          )}

          {selectedTab === 'recommendations' && aiResults.recommendations && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">추가 권고사항</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiResults.recommendations.immediate_actions?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      즉시 조치 필요
                    </h4>
                    <ul className="space-y-2">
                      {aiResults.recommendations.immediate_actions.map((action, index) => (
                        <li key={index} className="text-sm text-red-800 flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {sanitizeText(action)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResults.recommendations.scheduled_maintenance?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      계획된 유지보수
                    </h4>
                    <ul className="space-y-2">
                      {aiResults.recommendations.scheduled_maintenance.map((maintenance, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {sanitizeText(maintenance)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResults.recommendations.monitoring_points?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      모니터링 포인트
                    </h4>
                    <ul className="space-y-2">
                      {aiResults.recommendations.monitoring_points.map((point, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {sanitizeText(point)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResults.recommendations.framework_compliance?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      프레임워크 준수
                    </h4>
                    <ul className="space-y-2">
                      {aiResults.recommendations.framework_compliance.map((compliance, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {sanitizeText(compliance)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              처리 시간: {aiResults.analysis_summary?.processing_time}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                다시 분석
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRemediation;