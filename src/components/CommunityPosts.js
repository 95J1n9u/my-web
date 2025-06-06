import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';

const CommunityPosts = ({ user, onCreatePost, onViewPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'general', label: '일반' },
    { value: 'question', label: '질문' },
    { value: 'tip', label: '팁/노하우' },
    { value: 'discussion', label: '토론' },
    { value: 'bug-report', label: '버그 신고' },
    { value: 'feature-request', label: '기능 요청' },
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await authService.getPosts(20, selectedCategory);
      
      if (result.success) {
        setPosts(result.posts);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
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
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
          <p className="text-gray-600">네트워크 보안에 대한 정보를 공유하고 토론하세요</p>
        </div>
        {user && (
          <button
            onClick={onCreatePost}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            글 작성
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                selectedCategory === category.value
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadPosts}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory === 'all' ? '게시글이 없습니다' : `${getCategoryLabel(selectedCategory)} 카테고리에 게시글이 없습니다`}
            </h3>
            <p className="text-gray-500 mb-4">첫 번째 게시글을 작성해보세요!</p>
            {user && (
              <button
                onClick={onCreatePost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                게시글 작성하기
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <div
                key={post.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => onViewPost && onViewPost(post.id)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{post.authorName || '익명'}</span>
                      <span>•</span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login Prompt for Non-users */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                게시글을 작성하시려면 로그인이 필요합니다
              </p>
              <p className="text-sm text-blue-700">
                회원가입하시면 커뮤니티에 참여하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;