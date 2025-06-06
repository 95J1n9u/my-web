import React, { useState } from 'react';
import { authService } from '../config/firebase';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    // 회원가입 추가 검증
    if (!isLogin) {
      if (!formData.displayName || formData.displayName.trim().length < 2) {
        newErrors.displayName = '이름은 2자 이상 입력해주세요.';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let result;

      if (isLogin) {
        // 로그인
        result = await authService.signInWithEmail(
          formData.email,
          formData.password
        );
      } else {
        // 회원가입
        result = await authService.signUpWithEmail(
          formData.email,
          formData.password,
          formData.displayName.trim()
        );
      }

      if (result.success) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ submit: '인증 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await authService.signInWithGoogle();

      if (result.success) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ submit: 'Google 로그인 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setErrors({ reset: '이메일을 입력해주세요.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setErrors({ reset: '올바른 이메일 형식이 아닙니다.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await authService.resetPassword(resetEmail);

      if (result.success) {
        setResetMessage(
          '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.'
        );
        setResetEmail('');
      } else {
        setErrors({ reset: result.error });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ reset: '비밀번호 재설정 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      displayName: '',
      confirmPassword: '',
    });
    setErrors({});
    setResetMessage('');
    setResetEmail('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    resetForm();
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setErrors({});
    setResetMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showForgotPassword
              ? '비밀번호 재설정'
              : isLogin
                ? '로그인'
                : '회원가입'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isLoading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {showForgotPassword ? (
            /* 비밀번호 재설정 폼 */
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를
                보내드립니다.
              </div>

              <div>
                <label
                  htmlFor="resetEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reset ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이메일을 입력하세요"
                  disabled={isLoading}
                />
                {errors.reset && (
                  <p className="mt-1 text-xs text-red-600">{errors.reset}</p>
                )}
              </div>

              {resetMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{resetMessage}</p>
                </div>
              )}

              <button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    전송 중...
                  </>
                ) : (
                  '재설정 이메일 전송'
                )}
              </button>

              <button
                onClick={toggleForgotPassword}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                disabled={isLoading}
              >
                로그인으로 돌아가기
              </button>
            </div>
          ) : (
            /* 로그인/회원가입 폼 */
            <>
              {/* Google 로그인 버튼 */}
              <div className="mb-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google로 {isLogin ? '로그인' : '회원가입'}
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              {/* 이메일/비밀번호 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      이름 *
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.displayName
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="이름을 입력하세요"
                      disabled={isLoading}
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.displayName}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    이메일 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="비밀번호를 입력하세요 (6자 이상)"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      비밀번호 확인 *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="비밀번호를 다시 입력하세요"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      처리 중...
                    </>
                  ) : isLogin ? (
                    '로그인'
                  ) : (
                    '회원가입'
                  )}
                </button>
              </form>

              {/* 비밀번호 찾기 (로그인 모드에서만) */}
              {isLogin && (
                <div className="mt-4 text-center">
                  <button
                    onClick={toggleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              )}

              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLogin
                    ? '계정이 없으신가요? 회원가입'
                    : '이미 계정이 있으신가요? 로그인'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            {isLogin ? '로그인' : '회원가입'}하시면{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              서비스 이용약관
            </a>{' '}
            및{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              개인정보처리방침
            </a>
            에 동의하신 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
