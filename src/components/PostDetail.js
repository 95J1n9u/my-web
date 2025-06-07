import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import Comments from './Comments';

const PostDetail = ({ postId, user, onBack, onEdit, onDelete }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const result = await authService.getPost(postId);
      
      if (result.success) {
        setPost(result.post);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Failed to load post:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const result = await authService.deletePost(postId, user.uid);
      
      if (result.success) {
        alert('게시글이 삭제되었습니다.');
        onDelete && onDelete();
        onBack();
      } else {
        alert('삭제 실패: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = category => {
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

  const getCategoryLabel = category => {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">게시글을 찾을 수 없습니다</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const isAuthor = user && user.uid === post.authorId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </button>
        
        {isAuthor && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit && onEdit(post)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Category and Tags */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}>
            {getCategoryLabel(post.category)}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="inline-flex px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{post.title}</h1>

        {/* Meta Info */}
        <div className="flex items-center text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
          <span>{post.authorName || '익명'}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="mx-2">•</span>
          <span>조회 {post.views || 0}</span>
          {post.likes > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>좋아요 {post.likes}</span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글</h3>
        <Comments postId={post.id} user={user} />
      </div>
    </div>
  );
};

export default PostDetail;