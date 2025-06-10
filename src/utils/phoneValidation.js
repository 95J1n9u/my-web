// phoneValidation.js - SMS 인증 제거됨 (하위 호환성을 위해 유지)

/**
 * @deprecated SMS 인증이 제거되어 더 이상 사용되지 않습니다.
 * 하위 호환성을 위해 파일은 유지하지만 함수들은 빈 구현입니다.
 */

/**
 * @deprecated 더 이상 사용되지 않습니다.
 */
export const formatPhoneNumber = (phoneNumber) => {
  console.warn('formatPhoneNumber는 더 이상 사용되지 않습니다. SMS 인증이 제거되었습니다.');
  return phoneNumber || '';
};

/**
 * @deprecated 더 이상 사용되지 않습니다.
 */
export const validatePhoneNumber = (phoneNumber) => {
  console.warn('validatePhoneNumber는 더 이상 사용되지 않습니다. SMS 인증이 제거되었습니다.');
  return true; // 항상 true 반환하여 기존 코드가 깨지지 않도록 함
};

/**
 * @deprecated 더 이상 사용되지 않습니다.
 */
export const registerPhoneNumber = async (phoneNumber, uid) => {
  console.warn('registerPhoneNumber는 더 이상 사용되지 않습니다. SMS 인증이 제거되었습니다.');
  return true; // 항상 성공으로 처리
};