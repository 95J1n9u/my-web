import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRoleDisplayName } from '../utils/permissions';

const UserDebugInfo = ({ user }) => {
  const { isAdmin, userRole } = useAuth(user);

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 text-xs">
      <div className="font-bold mb-2">사용자 디버그 정보</div>
      <div>UID: {user?.uid || 'None'}</div>
      <div>Email: {user?.email || 'None'}</div>
      <div>Role: {user?.role || 'None'} ({getRoleDisplayName(user?.role)})</div>
      <div>Is Admin: {isAdmin() ? 'Yes' : 'No'}</div>
      <div>UserRole Hook: {userRole || 'None'}</div>
      <div className="mt-2 pt-2 border-t">
        <button
          onClick={() => console.log('Current user object:', user)}
          className="text-blue-600 underline"
        >
          Log User Object
        </button>
      </div>
    </div>
  );
};

export default UserDebugInfo;