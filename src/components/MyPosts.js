import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';

const MyPosts = ({ user, onCreatePost, onViewPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadUserPosts();
    }
  }, [user?.uid]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const result = await authService.getUserPosts(user.uid, 50);
      
      if (result.success) {
        setPosts(result.posts);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load user posts:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
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

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      question: 'bg-green-100 text-green-800',
      tip: 'bg-yellow-100 text-yellow-800',
      discussion: 'bg-purple-100 text-purple-800',
      'bug-report': 'bg-red-100 text-red-800',
      'feature-request': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      general: '일반',
      question: '질문',
      tip: '팁/노하우',
      discussion: '토론',
      'bug-report': '버그 신고',
      'feature-request': '기능 요청',
    };
    return labels[category] || category;
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">로그인 필요</h3>
        <p className="text-gray-500">내 게시글을 보려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">내 게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 게시글</h1>
          <p className="text-gray-600">
            내가 작성한 게시글을 관리하세요
            <span className="text-sm text-gray-500 ml-2">
              (총 {posts.length}개)
            </span>
          </p>
        </div>
        <button
          onClick={onCreatePost}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 글 작성
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadUserPosts}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">작성한 게시글이 없습니다</h3>
            <p className="text-gray-500 mb-4">첫 번째 게시글을 작성해보세요!</p>
            <button
              onClick={onCreatePost}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              게시글 작성하기
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <div
                key={post.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <h3 
                      className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                      onClick={() => onViewPost && onViewPost(post.id)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>조회 {post.views || 0}</span>
                      {post.likes > 0 && (
                        <>
                          <span>•</span>
                          <span>좋아요 {post.likes}</span>
                        </>
                      )}
                      {post.comments > 0 && (
                        <>
                          <span>•</span>
                          <span>댓글 {post.comments}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button 
                      onClick={() => onViewPost && onViewPost(post.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      보기
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700">
                      수정
                    </button>
                    <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;