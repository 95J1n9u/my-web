import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const CreateNotice = ({ user, onSuccess, onCancel }) => {
  const { isAdmin } = useAuth(user);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    isPinned: false,
    expiresAt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: '일반' },
    { value: 'maintenance', label: '점검' },
    { value: 'update', label: '업데이트' },
    { value: 'security', label: '보안' },
    { value: 'event', label: '이벤트' },
    { value: 'emergency', label: '긴급' },
  ];

  const priorities = [
    { value: 'normal', label: '일반' },
    { value: 'high', label: '높음' },
    { value: 'urgent', label: '긴급' },
  ];

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4m8 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">관리자 권한 필요</h3>
        <p className="text-gray-500">공지사항 작성은 관리자만 가능합니다.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const noticeData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        priority: formData.priority,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        authorName: user.displayName || user.email,
        authorEmail: user.email,
      };

      const result = await authService.createNotice(user.uid, noticeData);

      if (result.success) {
        alert('공지사항이 성공적으로 작성되었습니다!');
        if (onSuccess) onSuccess(result.noticeId);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      setError('공지사항 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">공지사항 작성</h1>
        <p className="text-gray-600">시스템 공지사항을 작성하세요</p>
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
              placeholder="공지사항 제목을 입력하세요"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {/* 카테고리와 우선순위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                우선순위
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 상단 고정 및 만료일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
                상단 고정
              </label>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                만료일 (선택사항)
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
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
              placeholder="공지사항 내용을 입력하세요..."
              disabled={isSubmitting}
              maxLength={5000}
            />
          </div>

          {/* 작성자 정보 */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-900 mb-2">관리자 정보</h4>
            <div className="text-sm text-red-700">
              <p>이름: {user.displayName || '관리자'}</p>
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
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  작성 중...
                </>
              ) : (
                '공지사항 발행'
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

export default CreateNotice;