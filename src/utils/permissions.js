// 권한 상수 정의
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator', // 선택사항
  PREMIUM: 'premium',
};

export const PERMISSIONS = {
  // 일반 기능
  ANALYZE_CONFIG: 'analyze_config',
  VIEW_RESULTS: 'view_results',
  SAVE_ANALYSIS: 'save_analysis',
  
  // 관리자 기능
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_ANALYSES: 'view_all_analyses',
  SYSTEM_SETTINGS: 'system_settings',
  VIEW_STATISTICS: 'view_statistics',
  MANAGE_FRAMEWORKS: 'manage_frameworks',
};

// 역할별 권한 매핑
const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: [
    PERMISSIONS.ANALYZE_CONFIG,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.SAVE_ANALYSIS,
  ],
  [USER_ROLES.ADMIN]: [
    // 관리자는 모든 권한
    ...Object.values(PERMISSIONS),
  ],
  [USER_ROLES.MODERATOR]: [
    PERMISSIONS.ANALYZE_CONFIG,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.SAVE_ANALYSIS,
    PERMISSIONS.VIEW_STATISTICS,
  ],
};

// 권한 체크 함수
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// 관리자 권한 체크
export const isAdmin = (userRole) => {
  return userRole === USER_ROLES.ADMIN;
};

// 중간 관리자 이상 권한 체크
export const isModerator = (userRole) => {
  return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MODERATOR;
};

// 역할 표시명
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.USER]: '일반 사용자',
    [USER_ROLES.ADMIN]: '관리자',
    [USER_ROLES.MODERATOR]: '중간 관리자',
    [USER_ROLES.PREMIUM]: 'PREMIUM',
  };
  return roleNames[role] || '알 수 없음';
};

// 역할 색상
export const getRoleColor = (role) => {
  const roleColors = {
    [USER_ROLES.USER]: 'bg-blue-100 text-blue-800',
    [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800',
    [USER_ROLES.MODERATOR]: 'bg-yellow-100 text-yellow-800',
    [USER_ROLES.PREMIUM]: 'bg-yellow-200 text-yellow-900',
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};