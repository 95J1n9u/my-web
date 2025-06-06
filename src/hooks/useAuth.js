import { useState, useEffect, useCallback } from 'react';
import { hasPermission, isAdmin, isModerator } from '../utils/permissions';

export const useAuth = (user) => {
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    } else {
      setUserRole(null);
    }
  }, [user?.role]); // user.role 변화만 감지

  // useCallback으로 함수들을 메모이제이션
  const checkPermission = useCallback((permission) => {
    return hasPermission(userRole, permission);
  }, [userRole]);

  const checkAdmin = useCallback(() => {
    return isAdmin(userRole);
  }, [userRole]);

  const checkModerator = useCallback(() => {
    return isModerator(userRole);
  }, [userRole]);

  return {
    userRole,
    hasPermission: checkPermission,
    isAdmin: checkAdmin,
    isModerator: checkModerator,
    isAuthenticated: !!user,
  };
};

// 권한 기반 컴포넌트 래퍼
export const withPermission = (permission) => (WrappedComponent) => {
  return function PermissionWrapper(props) {
    const { user } = props;
    const { hasPermission: checkPermission } = useAuth(user);

    if (!checkPermission(permission)) {
      return (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4m8 0V7a2 2 0 00-2-2H8a2 2 0 00-2 2v4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-500">이 기능을 사용할 권한이 없습니다.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};