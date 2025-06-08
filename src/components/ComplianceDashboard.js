import React from 'react';
import { sanitizeText } from '../utils/sanitizer';

const ComplianceDashboard = ({ complianceSummary, frameworkInfo }) => {
  if (!complianceSummary) return null;

  const {
    complianceRate,
    totalRules,
    passedRules,
    failedRules,
    skippedRules,
    severityBreakdown,
    categoryBreakdown
  } = complianceSummary;

  // 원형 진행률 컴포넌트
  const CircularProgress = ({ value, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${
              value >= 80 ? 'text-green-500' :
              value >= 60 ? 'text-yellow-500' :
              'text-red-500'
            }`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              value >= 80 ? 'text-green-600' :
              value >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {value}%
            </div>
            <div className="text-xs text-gray-500">준수율</div>
          </div>
        </div>
      </div>
    );
  };

// 심각도별 막대 차트
const SeverityChart = ({ data }) => {
  if (!data) return null;
  
  // 🔥 데이터 유효성 검증 추가
  console.log('SeverityChart data:', data, typeof data);
  
  // data가 객체가 아니거나 빈 객체인 경우 처리
  if (typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">심각도별 데이터가 없습니다.</p>
      </div>
    );
  }
  
  // 🔥 모든 값이 숫자인지 확인
  const validEntries = Object.entries(data).filter(([key, value]) => {
    return typeof value === 'number' && !isNaN(value);
  });
  
  if (validEntries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">유효한 심각도 데이터가 없습니다.</p>
      </div>
    );
  }
  
  const maxValue = Math.max(...validEntries.map(([, value]) => value));
  
  return (
    <div className="space-y-3">
      {validEntries.map(([severity, count]) => {
        const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
        const severityColors = {
          'High': 'bg-red-500',
          'Medium': 'bg-yellow-500', 
          'Low': 'bg-blue-500',
          'Critical': 'bg-red-600',
          '상': 'bg-red-500',
          '중': 'bg-yellow-500',
          '하': 'bg-blue-500'
        };
        
        return (
          <div key={severity} className="flex items-center space-x-3">
            <div className="w-16 text-sm text-gray-600 text-right">
              {severity}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ${severityColors[severity] || 'bg-gray-400'}`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {/* 🔥 숫자만 렌더링 보장 */}
                {typeof count === 'number' ? count : 0}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 카테고리별 도넛 차트 (간단한 버전)
const CategoryChart = ({ data }) => {
  if (!data) return null;
  
  // 🔥 데이터 유효성 검증 추가
  console.log('CategoryChart data:', data, typeof data);
  
  if (typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">카테고리별 데이터가 없습니다.</p>
      </div>
    );
  }
  
  // 🔥 유효한 엔트리만 필터링
  const validEntries = Object.entries(data).filter(([key, value]) => {
    return typeof value === 'number' && !isNaN(value);
  });
  
  if (validEntries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">유효한 카테고리 데이터가 없습니다.</p>
      </div>
    );
  }
  
  const total = validEntries.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">카테고리 데이터가 없습니다.</p>
      </div>
    );
  }

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-red-500', 'bg-purple-500', 'bg-indigo-500'
  ];

  return (
    <div className="space-y-2">
      {validEntries.map(([category, count], index) => {
        const percentage = (count / total) * 100;
        
        return (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
              <span className="text-sm text-gray-700 truncate" title={category}>
                {category}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {/* 🔥 안전한 렌더링 */}
              {typeof count === 'number' ? count : 0} ({percentage.toFixed(1)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          분석결과 대시보드
        </h3>
        {frameworkInfo && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: frameworkInfo.color + '20',
              color: frameworkInfo.color,
            }}
          >
            {frameworkInfo.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 전체 준수율 */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <CircularProgress value={complianceRate} />
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">전체 보안 준수율</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {passedRules} / {totalRules} 항목 통과
            </div>
          </div>
        </div>

        {/* 상태별 분포 */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">상태별 분포</h4>
          
          {/* 상태 카드들 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">통과</div>
                  <div className="text-xs text-green-700">보안 요구사항 충족</div>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">
                {passedRules}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-red-900">실패</div>
                  <div className="text-xs text-red-700">취약점 발견</div>
                </div>
              </div>
              <div className="text-lg font-bold text-red-600">
                {failedRules}
              </div>
            </div>

            {skippedRules > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">건너뜀</div>
                    <div className="text-xs text-gray-700">적용 불가</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-600">
                  {skippedRules}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="space-y-6">
          {/* 심각도별 분포 */}
          {severityBreakdown && Object.keys(severityBreakdown).length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">심각도별 분포</h4>
              <SeverityChart data={severityBreakdown} />
            </div>
          )}

          {/* 카테고리별 분포 */}
          {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">카테고리별 분포</h4>
              <CategoryChart data={categoryBreakdown} />
            </div>
          )}
        </div>
      </div>

      {/* 개선 권고사항 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-3">개선 권고사항</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceRate >= 90 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-900">우수한 보안 설정</span>
              </div>
              <p className="text-xs text-green-700">
                현재 보안 설정이 매우 우수합니다. 정기적인 점검을 통해 이 수준을 유지하세요.
              </p>
            </div>
          )}

          {complianceRate < 70 && failedRules > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium text-red-900">즉시 개선 필요</span>
              </div>
              <p className="text-xs text-red-700">
                {failedRules}개의 보안 취약점이 발견되었습니다. 우선순위에 따라 즉시 보완하세요.
              </p>
            </div>
          )}

          {complianceRate >= 70 && complianceRate < 90 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-yellow-900">추가 개선 권장</span>
              </div>
              <p className="text-xs text-yellow-700">
                양호한 보안 수준이지만 일부 개선이 필요합니다. 남은 취약점을 해결하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;