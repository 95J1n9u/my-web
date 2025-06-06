import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import VulnerabilityResults from './components/VulnerabilityResults';
import AnalysisHistory from './components/AnalysisHistory';
import DebugPanel from './components/DebugPanel';
import FirebaseTest from './components/FirebaseTest';
import analysisService from './services/analysisService';
import { authService, auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AdminPanel from './components/AdminPanel'; // 추가
import { useAuth } from './hooks/useAuth'; // 추가
import UserDebugInfo from './components/UserDebugInfo'; // 추가 (개발용)
import SignupPromptModal from './components/SignupPromptModal';
import CreatePost from './components/CreatePost';
import CreateNotice from './components/CreateNotice';
import CommunityPosts from './components/CommunityPosts';
import NoticesList from './components/NoticesList';
import MyPosts from './components/MyPosts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState('KISA');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [engineInfo, setEngineInfo] = useState(null);
  const [analysisRecordCount, setAnalysisRecordCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptDismissed, setSignupPromptDismissed] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateNotice, setShowCreateNotice] = useState(false);

  
  // 게시글 작성 성공 처리
  const handlePostCreateSuccess = (postId) => {
    setShowCreatePost(false);
    setActiveTab('community');
    console.log('새 게시글 작성됨:', postId);
  };

  // 공지사항 작성 성공 처리
  const handleNoticeCreateSuccess = (noticeId) => {
    setShowCreateNotice(false);
    setActiveTab('notices');
    console.log('새 공지사항 작성됨:', noticeId);
  };

  // Firebase 인증 상태 관리
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 모바일 사이드바 상태 관리
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 알림 상태 관리
  const [dismissedNotifications, setDismissedNotifications] = useState(
    new Set()
  );

// Firebase 인증 상태 변화 감지
useEffect(() => {
  if (!auth) {
    console.warn('Firebase Auth가 초기화되지 않았습니다.');
    setAuthLoading(false);
    return;
  }

  const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
    setAuthLoading(true);

    try {
      if (firebaseUser) {
        // 사용자가 로그인된 상태
        console.log('Firebase 사용자 감지:', firebaseUser.displayName, firebaseUser.uid);
        
        // Firestore에서 사용자 추가 정보 가져오기
        let userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '사용자',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          role: 'user', // 기본값
          lastLoginAt: new Date().toISOString(),
          analysisCount: 0,
          preferences: {},
        };

        try {
          // Firestore에서 추가 사용자 정보 가져오기
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('./config/firebase');
          
          if (db) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const firestoreData = userDoc.data();
              console.log('Firestore 사용자 데이터 로드:', firestoreData);
              
              userData = {
                ...userData,
                analysisCount: firestoreData.analysisCount || 0,
                role: firestoreData.role || 'user', // role 정보 명시적으로 설정
                preferences: firestoreData.preferences || {},
                createdAt: firestoreData.createdAt,
                lastLoginAt: firestoreData.lastLoginAt,
              };

              console.log('최종 사용자 데이터:', userData);
            } else {
              console.log('Firestore에 사용자 데이터가 없음, 기본값 사용');
            }
          }
        } catch (firestoreError) {
          console.error('Firestore 데이터 로드 실패:', firestoreError);
          // Firestore 로드 실패해도 Firebase Auth 정보는 사용
        }

        setUser(userData);

        // 분석 기록 수 로드
        if (userData.uid) {
          loadAnalysisRecordCount(userData.uid);
        }

        // 로컬 스토리지에 사용자 기본 정보 저장
        localStorage.setItem(
          'userSession',
          JSON.stringify({
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role, // role 정보 추가
            lastLogin: userData.lastLoginAt,
            analysisCount: userData.analysisCount,
          })
        );

        console.log('사용자 로그인 상태 확인 완료. Role:', userData.role);
      } else {
        // 사용자가 로그아웃된 상태
        setUser(null);
        setAnalysisRecordCount(0);
        localStorage.removeItem('userSession');
        console.log('사용자 로그아웃 상태');
      }
    } catch (error) {
      console.error('사용자 정보 처리 오류:', error);
      setUser(null);
      setAnalysisRecordCount(0);
    } finally {
      setAuthLoading(false);
    }
  });

  // 컴포넌트 언마운트 시 리스너 정리
  return () => unsubscribe();
}, []);

  // 알림 닫기 함수
  const dismissNotification = notificationId => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  // 모바일 사이드바 토글
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // 탭 변경시 모바일 사이드바 닫기
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  // Firebase 로그인 성공 처리
  const handleLoginSuccess = async userData => {
    console.log('로그인 성공:', userData);
    setUser(userData);

    // 로그인 시 분석 기록 수 로드
    if (userData.uid) {
      loadAnalysisRecordCount(userData.uid);
    }

    // 사용자 설정에 따른 초기화
    if (userData.preferences?.defaultFramework) {
      setSelectedFramework(userData.preferences.defaultFramework);
    }
  };

  // 분석 기록 수 로드 함수
  const loadAnalysisRecordCount = async (uid) => {
    try {
      console.log('분석 기록 수 로드 시작:', uid);
      const result = await authService.getUserAnalyses(uid, 1000); // 최대 100개로 제한
      if (result.success) {
        console.log('분석 기록 수 로드 성공:', result.analyses.length);
        setAnalysisRecordCount(result.analyses.length);
      } else {
        console.error('분석 기록 로드 실패:', result.error);
      }
    } catch (error) {
      console.error('Failed to load analysis record count:', error);
    }
  };

// 기존 refreshUserData 함수를 다음과 같이 수정
const refreshUserData = async (uid) => {
  try {
    console.log('사용자 정보 새로고침 시작:', uid);
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./config/firebase');
    
    if (db && uid) {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        console.log('업데이트된 사용자 데이터:', firestoreData);
        
        // 사용자 정보 완전히 새로고침
        setUser(prev => ({
          ...prev,
          role: firestoreData.role || 'user', // role 정보 명시적 업데이트
          analysisCount: firestoreData.analysisCount || 0,
          preferences: firestoreData.preferences || {},
          displayName: firestoreData.displayName || prev.displayName,
        }));

        // 로컬 스토리지도 업데이트
        const existingSession = localStorage.getItem('userSession');
        if (existingSession) {
          const sessionData = JSON.parse(existingSession);
          localStorage.setItem('userSession', JSON.stringify({
            ...sessionData,
            role: firestoreData.role || 'user', // role 정보 추가
            analysisCount: firestoreData.analysisCount || 0,
          }));
        }

        console.log('사용자 정보 새로고침 완료, 새 role:', firestoreData.role);
        return { success: true, role: firestoreData.role };
      }
    }
  } catch (error) {
    console.error('사용자 정보 새로고침 실패:', error);
    return { success: false, error: error.message };
  }
};

// 수동 새로고침 함수 추가
const forceRefreshUserData = async () => {
  if (user?.uid) {
    console.log('수동 사용자 정보 새로고침 시작');
    const result = await refreshUserData(user.uid);
    if (result.success) {
      alert(`사용자 정보가 새로고침되었습니다. 현재 권한: ${result.role}`);
    } else {
      alert('새로고침 실패: ' + result.error);
    }
  }
};

  // Firebase 로그아웃 처리
  const handleLogout = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
        setAnalysisRecordCount(0); // 기록 수도 초기화
        // 분석 관련 상태도 초기화
        setAnalysisResults(null);
        setComparisonResults(null);
        setUploadedFile(null);
        setAnalysisError(null);
        setActiveTab('dashboard');
        console.log('로그아웃 완료');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 서비스 상태 및 기본 정보 로드
  useEffect(() => {
    const initialize = async () => {
      await checkServiceHealth();
      await loadFrameworks();
      await loadDeviceTypes();
    };
    initialize();
  }, []); // eslint-disable-line

  const checkServiceHealth = async () => {
    try {
      const response = await analysisService.checkHealth();
      setServiceStatus('online');
      setEngineInfo({
        version: response.version,
        engineVersion: response.engineVersion,
        supportedFrameworks: response.supportedFrameworks,
        implementedFrameworks: response.implementedFrameworks,
        features: response.features,
        frameworkDetails: response.frameworkDetails,
      });
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceStatus('offline');
    }
  };

  const loadFrameworks = async () => {
    try {
      const response = await analysisService.getFrameworks();
      if (response.success) {
        setFrameworks(response.frameworks);
        // 기본값으로 첫 번째 구현된 지침서 선택
        const implementedFramework = response.frameworks.find(
          f => f.isImplemented
        );
        if (implementedFramework) {
          setSelectedFramework(implementedFramework.id);
        }
      }
    } catch (error) {
      console.error('Failed to load frameworks:', error);
      // API에서 로드 실패 시 기본값 설정
      setFrameworks([
        {
          id: 'KISA',
          name: 'KISA 네트워크 장비 보안 가이드',
          description:
            '한국인터넷진흥원(KISA) 네트워크 장비 보안 점검 가이드라인',
          isImplemented: true,
          status: 'active',
          total_rules: 38,
          version: '2024',
        },
        {
          id: 'CIS',
          name: 'CIS Controls',
          description: 'Center for Internet Security Controls',
          isImplemented: true,
          status: 'active',
          total_rules: 89,
          version: 'v8',
        },
        {
          id: 'NW',
          name: 'NW 네트워크 보안 지침서',
          description: '네트워크 보안 강화 지침서',
          isImplemented: true,
          status: 'active',
          total_rules: 42,
          version: '2024',
        },
        {
          id: 'NIST',
          name: 'NIST Cybersecurity Framework',
          description:
            'National Institute of Standards and Technology Cybersecurity Framework',
          isImplemented: false,
          status: 'planned',
          total_rules: 0,
          version: '2.0',
        },
      ]);
    }
  };

  const loadDeviceTypes = async (framework = 'KISA') => {
    try {
      const response = await analysisService.getDeviceTypes(framework);
      if (response.success) {
        setDeviceTypes(response.deviceTypes);
      }
    } catch (error) {
      console.error('Failed to load device types:', error);
      // 기본값 설정
      setDeviceTypes([
        'Cisco',
        'Juniper',
        'HP',
        'Piolink',
        'Radware',
        'Passport',
        'Alteon',
        'Dasan',
        'Alcatel',
        'Extreme',
      ]);
    }
  };

  const handleFileUpload = async (
    file,
    deviceType,
    framework,
    comparisonFrameworks
  ) => {
    if (!file || !deviceType) {
      setAnalysisError('파일과 장비 타입을 모두 선택해주세요.');
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    setComparisonResults(null);

    try {
      // 파일을 텍스트로 변환
      const configText = await analysisService.fileToText(file);

      if (!configText.trim()) {
        throw new Error('파일이 비어있거나 읽을 수 없습니다.');
      }

      let finalResults = null;
      let isComparison = false;

      // 비교 분석 모드인 경우
      if (comparisonFrameworks && comparisonFrameworks.length > 1) {
        console.log(
          'Starting comparison analysis with frameworks:',
          comparisonFrameworks
        );

        isComparison = true;
        const comparisonResult = await analysisService.compareAnalysis(
          deviceType,
          configText,
          comparisonFrameworks
        );

        // 비교 결과를 UI 형식으로 변환
        const transformedResults = {};
        for (const [frameworkId, result] of Object.entries(
          comparisonResult.frameworks
        )) {
          if (result.success) {
            transformedResults[frameworkId] =
              analysisService.transformAnalysisResult(result);
          } else {
            transformedResults[frameworkId] = { error: result.error };
          }
        }

        finalResults = {
          ...comparisonResult,
          frameworks: transformedResults,
        };
        setComparisonResults(finalResults);
      } else {
        // 단일 지침서 분석
        const selectedFrameworkId = framework || selectedFramework;
        console.log(
          'Starting single framework analysis with:',
          selectedFrameworkId
        );

        const apiResult = await analysisService.analyzeConfig(
          deviceType,
          configText,
          selectedFrameworkId
        );
        const transformedResult =
          analysisService.transformAnalysisResult(apiResult);

        finalResults = transformedResult;
        setAnalysisResults(finalResults);
      }

      setActiveTab('results'); // 결과 화면으로 이동

      // 로그인하지 않은 사용자에게 회원가입 유도 팝업 표시
      if (!user && !signupPromptDismissed) {
        setTimeout(() => {
          setShowSignupPrompt(true);
        }, 1000);
      }

      // 로그인된 사용자의 분석 결과를 Firestore에 저장
      if (user?.uid && finalResults) {
        try {
          const analysisData = {
            deviceType: deviceType,
            framework: isComparison
              ? comparisonFrameworks.join(', ')
              : framework || selectedFramework,
            fileName: file.name,
            fileSize: file.size,
            isComparison: isComparison,
            comparisonFrameworks: isComparison ? comparisonFrameworks : null,

            // 결과 요약 (비교 분석의 경우 첫 번째 성공한 결과 사용)
            summary: isComparison
              ? Object.values(finalResults.frameworks).find(r => !r.error)
                  ?.summary || {}
              : finalResults.summary,

            // 메타데이터
            metadata: isComparison
              ? Object.values(finalResults.frameworks).find(r => !r.error)
                  ?.metadata || {}
              : finalResults.metadata,

            // 취약점 목록 (비교 분석의 경우 모든 프레임워크의 취약점 합계)
            vulnerabilities: isComparison
              ? Object.values(finalResults.frameworks)
                  .filter(r => !r.error)
                  .flatMap(r => r.vulnerabilities || [])
                  .slice(0, 10) // 최대 10개만 저장
              : finalResults.vulnerabilities || [],
          };

          // 보안 점수 계산
          if (
            analysisData.summary.totalChecks &&
            analysisData.summary.totalChecks > 0
          ) {
            analysisData.summary.securityScore = Math.round(
              ((analysisData.summary.totalChecks -
                (analysisData.summary.vulnerabilities || 0)) /
                analysisData.summary.totalChecks) *
                100
            );
          }

          console.log('Saving analysis result to Firestore:', analysisData);
          const saveResult = await authService.saveAnalysisResult(
            user.uid,
            analysisData
          );

          if (saveResult.success) {
            console.log(
              'Analysis result saved successfully:',
              saveResult.analysisId
            );

            setAnalysisRecordCount(prev => prev + 1);
          } else {
            console.error('Failed to save analysis result:', saveResult.error);
          }

          // 분석 횟수 증가
          await authService.incrementAnalysisCount(user.uid);

          // 사용자 정보 새로고침 (Firestore에서 최신 정보 가져오기)
          await refreshUserData(user.uid);

          console.log('분석 완료 및 사용자 정보 업데이트 완료');

          // 사용자 상태 업데이트 (분석 횟수 증가 반영)
          setUser(prev => ({
            ...prev,
            analysisCount: (prev.analysisCount || 0) + 1,
          }));
                    // 대시보드가 활성화되어 있다면 통계 새로고침을 위해 리렌더링 유도
          if (activeTab === 'dashboard') {
            // 강제로 컴포넌트 리렌더링을 유도하여 새로운 통계 로드
            setActiveTab('results'); // 잠시 다른 탭으로 변경
            setTimeout(() => setActiveTab('dashboard'), 100); // 다시 대시보드로 돌아감
          }
        } catch (saveError) {
          console.error('Error saving analysis result:', saveError);
          // 저장 실패해도 분석 결과는 표시
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message);
      setActiveTab('results');
    } finally {
      setIsAnalyzing(false);
    }
  };
// 회원가입 유도 팝업 핸들러들
const handleCloseSignupPrompt = () => {
  setShowSignupPrompt(false);
  setSignupPromptDismissed(true); // 세션 동안 다시 표시하지 않음
};

const handleSignupSuccess = (userData) => {
  handleLoginSuccess(userData); // 기존 로그인 성공 핸들러 재사용
  setShowSignupPrompt(false);
  setSignupPromptDismissed(true);
};
  const handleRetryAnalysis = () => {
    if (uploadedFile) {
      setActiveTab('upload');
      setAnalysisError(null);
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setComparisonResults(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setActiveTab('upload');
  };

  const handleFrameworkChange = frameworkId => {
    setSelectedFramework(frameworkId);
    loadDeviceTypes(frameworkId);

    // 로그인된 사용자의 기본 지침서 설정 업데이트
    if (user?.uid) {
      authService
        .updateUserPreferences(user.uid, {
          ...user.preferences,
          defaultFramework: frameworkId,
        })
        .catch(error => {
          console.error('Failed to update default framework:', error);
        });
    }
  };

  // 현재 표시할 결과 결정 (단일 분석 또는 비교 분석)
  const getCurrentResults = () => {
    if (comparisonResults) {
      // 비교 분석 결과에서 첫 번째 성공한 결과를 기본으로 표시
      const firstSuccessfulResult = Object.values(
        comparisonResults.frameworks
      ).find(result => !result.error);
      return firstSuccessfulResult || null;
    }
    return analysisResults;
  };

  // 지침서별 통계 정보 계산
  const getFrameworkStats = () => {
    const implementedFrameworks = frameworks.filter(f => f.isImplemented);
    return {
      total: frameworks.length,
      implemented: implementedFrameworks.length,
      totalRules: implementedFrameworks.reduce(
        (sum, f) => sum + (f.total_rules || 0),
        0
      ),
      byFramework: implementedFrameworks.reduce((acc, f) => {
        acc[f.id] = f.total_rules || 0;
        return acc;
      }, {}),
    };
  };

  const frameworkStats = getFrameworkStats();

  // 인증 로딩 중 화면
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            NetSecure 로딩 중
          </h3>
          <p className="text-gray-500">인증 상태를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* 모바일 오버레이 */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed lg:relative lg:translate-x-0 transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          serviceStatus={serviceStatus}
          engineInfo={{
            ...engineInfo,
            frameworkStats,
          }}
          user={user}
          analysisRecordCount={analysisRecordCount}
        />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Header
          serviceStatus={serviceStatus}
          selectedFramework={selectedFramework}
          frameworks={frameworks}
          onFrameworkChange={handleFrameworkChange}
          engineInfo={engineInfo}
          onToggleMobileSidebar={toggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
          user={user}
          onLogin={handleLoginSuccess}
          onLogout={handleLogout}
          onRefreshUser={forceRefreshUserData}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                analysisResults={getCurrentResults()}
                comparisonResults={comparisonResults}
                serviceStatus={serviceStatus}
                selectedFramework={selectedFramework}
                frameworks={frameworks}
                engineInfo={{
                  ...engineInfo,
                  frameworkStats,
                }}
                onNavigateToUpload={() => handleTabChange('upload')}
                onNavigateToResults={() => handleTabChange('results')}
                onNavigateToAdmin={() => handleTabChange('admin')}
                user={user}
              />
            )}
            {activeTab === 'community' && (
              showCreatePost ? (
                <CreatePost
                  user={user}
                  onSuccess={handlePostCreateSuccess}
                  onCancel={() => setShowCreatePost(false)}
                />
              ) : (
                <CommunityPosts
                  user={user}
                  onCreatePost={() => setShowCreatePost(true)}
                  onViewPost={(postId) => {
                    console.log('View post:', postId);
                    // TODO: 게시글 상세 보기 구현
                  }}
                />
              )
            )}
            {activeTab === 'notices' && (
              showCreateNotice ? (
                <CreateNotice
                  user={user}
                  onSuccess={handleNoticeCreateSuccess}
                  onCancel={() => setShowCreateNotice(false)}
                />
              ) : (
                <NoticesList
                  user={user}
                  onCreateNotice={() => setShowCreateNotice(true)}
                  onViewNotice={(noticeId) => {
                    console.log('View notice:', noticeId);
                    // TODO: 공지사항 상세 보기 구현
                  }}
                />
              )
            )}
            {activeTab === 'my-posts' && user && (
              <MyPosts
                user={user}
                onCreatePost={() => setShowCreatePost(true)}
                onViewPost={(postId) => {
                  console.log('View my post:', postId);
                  // TODO: 게시글 상세 보기 구현
                }}
              />
            )}
            {activeTab === 'upload' && (
              <FileUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                isAnalyzing={isAnalyzing}
                frameworks={frameworks}
                deviceTypes={deviceTypes}
                selectedFramework={selectedFramework}
                analysisError={analysisError}
                onReset={resetAnalysis}
                user={user}
              />
            )}
            {activeTab === 'results' && (
              <VulnerabilityResults
                results={getCurrentResults()}
                comparisonResults={comparisonResults}
                isAnalyzing={isAnalyzing}
                error={analysisError}
                selectedFramework={selectedFramework}
                frameworks={frameworks}
                onRetry={handleRetryAnalysis}
                onReset={resetAnalysis}
                user={user}
              />
            )}
            {activeTab === 'history' && user && (
              <AnalysisHistory
                user={user}
                onSelectAnalysis={analysis => {
                  console.log('Selected analysis:', analysis);
                }}
                onRecordCountChange={(newCount) => {
                  setAnalysisRecordCount(newCount);
                }}
              />
            )}
            {/* 관리자 패널 추가 */}
            {activeTab === 'admin' && user && (
              <AdminPanel user={user} />
            )}
          </div>
        </main>
      </div>

      {/* 상태 표시 - 모바일 최적화 */}
      {serviceStatus === 'checking' && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-50 max-w-xs">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">연결 확인 중...</span>
          </div>
        </div>
      )}

      {serviceStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-50 rounded-lg shadow-lg p-3 border border-red-200 z-50 max-w-xs">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-sm text-red-800">연결 실패</span>
          </div>
        </div>
      )}

      {/* 분석 진행 오버레이 */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                분석 진행 중
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {comparisonResults
                  ? '다중 지침서 분석 중'
                  : `${selectedFramework} 지침서 분석 중`}
              </p>
              <div className="text-xs text-gray-500">
                잠시만 기다려주세요...
              </div>
              {user && (
                <div className="text-xs text-blue-600 mt-2">
                  분석 완료 시 기록에 저장됩니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Firebase 디버깅 패널 (개발 환경에서만) */}
      <DebugPanel />

      {/* 사용자 권한 디버깅 (개발 환경에서만) */}
      <UserDebugInfo user={user} />

      {/* 회원가입 유도 팝업 */}
      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={handleCloseSignupPrompt}
        onLoginSuccess={handleSignupSuccess}
        analysisResults={getCurrentResults()}
/>
      {/* Firebase 연결 테스트 (개발 환경에서만) */}
      {/*process.env.NODE_ENV === 'development' && <FirebaseTest />*/}
    </div>
    
  );
}


export default App;
