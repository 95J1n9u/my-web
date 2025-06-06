import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';

const CreatePost = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: '일반' },
    { value: 'question', label: '질문' },
    { value: 'tip', label: '팁/노하우' },
    { value: 'discussion', label: '토론' },
    { value: 'bug-report', label: '버그 신고' },
    { value: 'feature-request', label: '기능 요청' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        authorName: user.displayName || user.email,
        authorEmail: user.email,
      };

      const result = await authService.createPost(user.uid, postData);

      if (result.success) {
        alert('게시글이 성공적으로 작성되었습니다!');
        if (onSuccess) onSuccess(result.postId);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">게시글 작성</h1>
        <p className="text-gray-600">커뮤니티에 새로운 게시글을 작성하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="게시글 제목을 입력하세요"
              disabled={isSubmitting}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 태그 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그 (선택사항)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 네트워크, 보안, Cisco)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다</p>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="게시글 내용을 입력하세요..."
              disabled={isSubmitting}
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.content.length}/5000</p>
          </div>

          {/* 작성자 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">작성자 정보</h4>
            <div className="text-sm text-gray-600">
              <p>이름: {user.displayName || '익명'}</p>
              <p>이메일: {user.email}</p>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isSubmitting || !formData.title.trim() || !formData.content.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  작성 중...
                </>
              ) : (
                '게시글 작성'
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;