import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import { USER_ROLES, getRoleDisplayName, getRoleColor, PERMISSIONS } from '../utils/permissions';
import { useAuth } from '../hooks/useAuth';

const AdminPanel = ({ user }) => {
  const { isAdmin, hasPermission } = useAuth(user);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 사용자 목록과 시스템 통계 병렬 로드
      const [usersResult, statsResult] = await Promise.all([
        authService.getAllUsers(user.uid, 100),
        authService.getSystemStats(user.uid),
      ]);

      if (usersResult.success) {
        setUsers(usersResult.users);
      } else {
        setError(usersResult.error);
      }

      if (statsResult.success) {
        setSystemStats(statsResult.stats);
      }

    } catch (error) {
      console.error('Failed to load admin data:', error);
      setError('데이터 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUid, newRole) => {
    try {
      const result = await authService.updateUserRole(user.uid, targetUid, newRole);
      
      if (result.success) {
        // 사용자 목록 업데이트
        setUsers(prev => prev.map(u => 
          u.uid === targetUid ? { ...u, role: newRole } : u
        ));
        setShowRoleModal(false);
        setSelectedUser(null);
        alert('사용자 권한이 변경되었습니다.');
      } else {
        alert('권한 변경 실패: ' + result.error);
      }
    } catch (error) {
      console.error('Role change error:', error);
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

  // 관리자 권한이 없으면 접근 거부
  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4m8 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">관리자 권한 필요</h3>
        <p className="text-gray-500">이 페이지에 접근하려면 관리자 권한이 필요합니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">관리자 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">관리자 패널</h1>
        <p className="text-gray-600">시스템 관리 및 사용자 권한 관리</p>
      </div>

      {/* Stats Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 분석 수</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalAnalyses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                <p className="text-xs text-gray-500">최근 30일</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">신규 가입</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.recentSignups}</p>
                <p className="text-xs text-gray-500">최근 7일</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            사용자 관리 ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            상세 통계
          </button>
        </nav>
      </div>

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">사용자 목록</h3>
              <button
                onClick={loadData}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                새로고침
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분석 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((targetUser) => (
                  <tr key={targetUser.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {targetUser.photoURL ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={targetUser.photoURL}
                              alt={targetUser.displayName || targetUser.email}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {targetUser.displayName?.charAt(0) || targetUser.email?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {targetUser.displayName || '이름 없음'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {targetUser.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(targetUser.role)}`}>
                        {getRoleDisplayName(targetUser.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {targetUser.analysisCount || 0}회
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {targetUser.createdAt?.toDate().toLocaleDateString('ko-KR') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {targetUser.uid !== user.uid && (
                        <button
                          onClick={() => {
                            setSelectedUser(targetUser);
                            setShowRoleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          권한 변경
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && systemStats && (
        <div className="space-y-6">
          {/* Role Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">권한별 사용자 분포</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(systemStats.usersByRole).map(([role, count]) => (
                <div key={role} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{getRoleDisplayName(role)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">가입 방법별 분포</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemStats.usersByProvider.email}</div>
                <div className="text-sm text-gray-600">이메일 가입</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{systemStats.usersByProvider.google}</div>
                <div className="text-sm text-gray-600">Google 로그인</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              사용자 권한 변경
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{selectedUser.displayName || selectedUser.email}</strong>의 권한을 변경하시겠습니까?
            </p>
            
            <div className="space-y-2 mb-6">
              {Object.values(USER_ROLES).map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    name="newRole"
                    value={role}
                    defaultChecked={selectedUser.role === role}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {getRoleDisplayName(role)}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const newRole = document.querySelector('input[name="newRole"]:checked')?.value;
                  if (newRole) {
                    handleRoleChange(selectedUser.uid, newRole);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;