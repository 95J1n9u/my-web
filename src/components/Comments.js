import React, { useState, useEffect } from 'react';
import { authService } from '../config/firebase';
import { sanitizeText } from '../utils/sanitizer';

const Comments = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const result = await authService.getComments(postId, 50);
      if (result.success) {
        setComments(result.comments);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const commentData = {
        content: sanitizeText(newComment.trim()),
        authorName: user.displayName || user.email,
      };
      const result = await authService.createComment(
        postId,
        user.uid,
        commentData
      );
      if (result.success) {
        setNewComment('');
        loadComments();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async commentId => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const result = await authService.deleteComment(
        postId,
        commentId,
        user.uid
      );
      if (result.success) {
        loadComments();
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-gray-500">댓글을 불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">첫 번째 댓글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  <span className="font-medium mr-2">
                    {comment.authorName || '익명'}
                  </span>
                  <span className="text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {user && comment.authorId === user.uid && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap break-words mt-1">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {user && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows="3"
            placeholder="댓글을 입력하세요"
          />
          <div className="text-right">
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              댓글 작성
            </button>
          </div>
        </form>
      )}

      {!user && (
        <p className="text-sm text-blue-600">댓글을 작성하려면 로그인하세요.</p>
      )}
    </div>
  );
};

export default Comments;
