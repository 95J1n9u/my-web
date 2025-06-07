import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../config/firebase';
import PostDetail from './PostDetail';
import EditPost from './EditPost';

const CommunityPosts = ({ user, onCreatePost, activeTab}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('list');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const lastActiveTabRef = useRef(activeTab);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'general', label: '일반' },
    { value: 'question', label: '질문' },
    { value: 'tip', label: '팁/노하우' },
    { value: 'discussion', label: '토론' },
    { value: 'bug-report', label: '버그 신고' },
    { value: 'feature-request', label: '기능 요청' },
  ];
  
 // activeTab이 변경될 때만 감지
  useEffect(() => {
    if (activeTab === 'community' && lastActiveTabRef.current !== 'community') {
      // 다른 탭에서 커뮤니티로 전환될 때만 목록으로 돌아가기
      setCurrentView('list');
      setSelectedPostId(null);
      setEditingPost(null);
    }
    lastActiveTabRef.current = activeTab;
  }, [activeTab]);


  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const result = await authService.getPosts(50, selectedCategory); // 더 많은 게시글 로드
      
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

  const handleViewPost = (postId) => {
    setSelectedPostId(postId);
    setCurrentView('detail');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPostId(null);
    setEditingPost(null);
    loadPosts();
  };

  const handlePostUpdated = () => {
    handleBackToList();
  };

  const handlePostDeleted = () => {
    handleBackToList();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    }).replace(/\./g, '/');
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

  // 게시글 번호 계산 (최신글이 가장 큰 번호)
  const getPostNumber = (index) => {
    return posts.length - index;
  };

  // 게시글 상세보기 화면
  if (currentView === 'detail') {
    return (
      <PostDetail
        postId={selectedPostId}
        user={user}
        onBack={handleBackToList}
        onEdit={handleEditPost}
        onDelete={handlePostDeleted}
      />
    );
  }

  // 게시글 수정 화면
  if (currentView === 'edit') {
    return (
      <EditPost
        post={editingPost}
        user={user}
        onSuccess={handlePostUpdated}
        onCancel={handleBackToList}
      />
    );
  }

  // 게시글 목록 화면
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

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 community-table">
              {/* Table Header */}
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    조회
                    </th>
                </tr>
                </thead>
                        
              {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post, index) => (
                    <tr 
                    key={post.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleViewPost(post.id)}
                    >
                    {/* 번호 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {getPostNumber(index)}
                    </td>
                    
                    {/* 카테고리 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`category-badge inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                        </span>
                    </td>
                    
                    {/* 제목 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 hover:text-blue-600 post-title truncate max-w-md">
                        {post.title}
                    </span>
                    </td>
                    
                    {/* 작성자 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                        {post.authorName || '익명'}
                        </div>
                    </td>
                    
                    {/* 작성일 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                    </td>
                    
                    {/* 조회수 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {post.views || 0}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Count Info */}
      {posts.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>총 {posts.length}개의 게시글</span>
          <span>
            {selectedCategory !== 'all' && `${getCategoryLabel(selectedCategory)} 카테고리`}
            
          </span>
        </div>
      )}

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