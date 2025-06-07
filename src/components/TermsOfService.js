import React from 'react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">서비스 이용약관</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 전문 */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              NetSecure 네트워크 보안 분석 서비스(이하 "서비스")를 이용해 주셔서 감사합니다. 
              본 약관은 서비스 이용에 관한 기본적인 사항을 규정하며, 서비스를 이용하시기 전에 반드시 읽어보시기 바랍니다.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>시행일:</strong> 2025년 1월 1일<br />
                <strong>최종 수정일:</strong> 2025년 6월 7일
              </p>
            </div>
          </section>

          {/* 제1조 목적 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제1조 (목적)</h3>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 NetSecure(이하 "회사")가 제공하는 네트워크 장비 설정 파일 보안 분석 서비스의 이용조건 및 절차, 
              회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 정의 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제2조 (정의)</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">1. "서비스"란</span> 회사가 제공하는 네트워크 장비 설정 파일 업로드, 보안 취약점 분석, 
                분석 결과 제공, 커뮤니티 기능 등을 포함한 모든 서비스를 의미합니다.
              </div>
              <div>
                <span className="font-medium">2. "이용자"란</span> 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.
              </div>
              <div>
                <span className="font-medium">3. "회원"란</span> 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 
                회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
              </div>
              <div>
                <span className="font-medium">4. "설정 파일"이란</span> 네트워크 장비(라우터, 스위치, 방화벽 등)에서 추출한 구성 설정 정보가 담긴 텍스트 파일을 의미합니다.
              </div>
            </div>
          </section>

          {/* 제3조 약관의 게시와 개정 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제3조 (약관의 게시와 개정)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
              <p>2. 회사는 필요하다고 인정되는 경우 본 약관을 개정할 수 있습니다.</p>
              <p>3. 개정된 약관은 적용일자 및 개정사유를 명시하여 현행약관과 함께 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</p>
            </div>
          </section>

          {/* 제4조 서비스의 제공 및 변경 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제4조 (서비스의 제공 및 변경)</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>1. 회사가 제공하는 서비스는 다음과 같습니다:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>네트워크 장비 설정 파일 업로드 및 분석</li>
                <li>KISA, CIS, NW 등 다중 보안 지침서 기반 취약점 진단</li>
                <li>분석 결과 리포트 제공 및 다운로드</li>
                <li>분석 기록 저장 및 관리</li>
                <li>커뮤니티 게시판 이용</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
              <p>2. 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</p>
              <p>3. 서비스의 변경이 있는 경우에는 변경될 서비스의 내용 및 제공일자를 명시하여 사전에 공지합니다.</p>
            </div>
          </section>

          {/* 제5조 서비스 이용계약의 성립 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제5조 (서비스 이용계약의 성립)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 이용계약은 이용자가 약관에 동의하고 회원가입을 신청하면 회사가 이를 승낙함으로써 성립합니다.</p>
              <p>2. 회원가입은 이메일/비밀번호 방식 또는 Google 소셜 로그인을 통해 가능합니다.</p>
              <p>3. 회사는 다음의 경우에 회원가입을 거절할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                <li>기타 회원가입을 신청하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </div>
          </section>

          {/* 제6조 개인정보보호 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제6조 (개인정보보호)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 이용자의 개인정보 수집시 서비스 제공에 필요한 범위에서 최소한의 개인정보를 수집합니다.</p>
              <p>2. 회사는 수집된 개인정보를 목적외의 용도로 이용할 수 없으며, 새로운 이용목적이 발생한 경우 사전에 동의를 받습니다.</p>
              <p>3. 개인정보의 처리에 관한 자세한 사항은 개인정보처리방침을 참조하시기 바랍니다.</p>
            </div>
          </section>

          {/* 제7조 이용자의 의무 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제7조 (이용자의 의무)</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>이용자는 다음 행위를 하여서는 안 됩니다:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>신청 또는 변경시 허위 내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>타인의 개인정보나 기밀정보가 포함된 설정 파일을 무단으로 업로드하는 행위</li>
                <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하는 행위</li>
              </ul>
            </div>
          </section>

          {/* 제8조 서비스 이용제한 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제8조 (서비스 이용제한)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>
              <p>2. 회사는 다음의 경우 즉시 서비스 이용을 정지할 수 있습니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>타인의 개인정보를 도용한 경우</li>
                <li>서비스 운영을 고의로 방해한 경우</li>
                <li>기타 관련법령이나 회사가 정한 이용조건에 위반한 경우</li>
              </ul>
            </div>
          </section>

          {/* 제9조 업로드 파일 및 데이터 보안 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제9조 (업로드 파일 및 데이터 보안)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 업로드된 설정 파일은 분석 완료 후 즉시 서버에서 삭제됩니다.</p>
              <p>2. 분석 결과는 회원의 개인 계정에만 저장되며, 암호화하여 보관됩니다.</p>
              <p>3. 회사는 업로드된 파일의 내용을 분석 목적 이외에 사용하지 않습니다.</p>
              <p>4. 이용자는 업로드하는 파일에 개인정보나 기밀정보가 포함되지 않도록 주의해야 합니다.</p>
            </div>
          </section>

          {/* 제10조 책임제한 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제10조 (책임제한)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
              <p>3. 회사는 분석 결과의 정확성을 보장하지 않으며, 분석 결과에 따른 조치로 인한 손해에 대해 책임을 지지 않습니다.</p>
              <p>4. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나 상실한 것에 대하여는 책임을 지지 않습니다.</p>
            </div>
          </section>

          {/* 제11조 분쟁해결 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제11조 (분쟁해결)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.</p>
              <p>2. 회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.</p>
            </div>
          </section>

          {/* 부칙 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">부칙</h3>
            <div className="space-y-3 text-gray-700">
              <p>본 약관은 2025년 1월 1일부터 적용됩니다.</p>
            </div>
          </section>

          {/* 연락처 */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">서비스 문의</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>서비스명:</strong> NetSecure 네트워크 보안 분석 서비스</p>
              <p><strong>운영자:</strong> NetSecure Team</p>
              <p><strong>이메일:</strong> support@netsecure.com</p>
              <p><strong>고객센터:</strong> 1588-0000 (평일 09:00-18:00)</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;