import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import EditNotice from './EditNotice'; // 새로 추가

const NoticesList = ({ user, onCreateNotice, onViewNotice }) => {
  const { isAdmin } = useAuth(user);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'edit' 상태 추가
  const [editingNotice, setEditingNotice] = useState(null); // 수정할 공지사항 상태 추가

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const result = await authService.getNotices(20);
      
      if (result.success) {
        setNotices(result.notices);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load notices:', error);
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingNotice(null);
    loadNotices(); // 목록 새로고침
  };

  const handleNoticeUpdated = () => {
    handleBackToList();
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await authService.deleteNotice(noticeId, user.uid);
      
      if (result.success) {
        alert('공지사항이 삭제되었습니다.');
        loadNotices(); // 목록 새로고침
      } else {
        alert('삭제 실패: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 화면 렌더링
  if (currentView === 'edit') {
    return (
      <EditNotice
        notice={editingNotice}
        user={user}
        onSuccess={handleNoticeUpdated}
        onCancel={handleBackToList}
      />
    );
  }

  // 나머지 함수들과 JSX는 이전과 동일하지만, 수정 버튼 클릭 핸들러만 변경
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      normal: '일반',
      high: '높음',
      urgent: '긴급',
    };
    return labels[priority] || priority;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-orange-100 text-orange-800',
      update: 'bg-green-100 text-green-800',
      security: 'bg-red-100 text-red-800',
      event: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-200 text-red-900',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general: '일반',
      maintenance: '점검',
      update: '업데이트',
      security: '보안',
      event: '이벤트',
      emergency: '긴급',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">공지사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
          <p className="text-gray-600">시스템 공지사항과 업데이트 정보를 확인하세요</p>
        </div>
        {isAdmin() && (
          <button
            onClick={onCreateNotice}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            공지 작성
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadNotices}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Notices List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {notices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">공지사항이 없습니다</h3>
            <p className="text-gray-500">새로운 공지사항이 있을 때 알려드리겠습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notices.map(notice => (
              <div
                key={notice.id}
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  notice.isPinned ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onViewNotice && onViewNotice(notice.id)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {notice.isPinned && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          고정
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notice.category)}`}>
                        {getCategoryLabel(notice.category)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notice.priority)}`}>
                        {getPriorityLabel(notice.priority)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notice.content.length > 150 ? `${notice.content.substring(0, 150)}...` : notice.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="font-medium text-red-600">관리자</span>
                      <span>•</span>
                      <span>{formatDate(notice.createdAt)}</span>
                      <span>•</span>
                      <span>조회 {notice.views || 0}</span>
                      {notice.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">
                            만료: {formatDate(notice.expiresAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 관리자 액션 버튼 */}
                  {isAdmin() && (
                    <div className="ml-4 flex flex-col space-y-2">
                      {notice.priority === 'urgent' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mb-2">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          긴급
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNotice(notice); // 수정 함수 호출
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotice(notice.id);
                          }}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Info */}
      {!isAdmin() && user && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                공지사항은 관리자만 작성할 수 있습니다
              </p>
              <p className="text-sm text-gray-600">
                일반 사용자는 커뮤니티 게시판을 이용해주세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesList;