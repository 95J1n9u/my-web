import React from 'react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">개인정보처리방침</h2>
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
              NetSecure(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>시행일:</strong> 2025년 1월 1일<br />
                <strong>최종 수정일:</strong> 2025년 6월 7일
              </p>
            </div>
          </section>

          {/* 제1조 개인정보의 처리목적 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제1조 (개인정보의 처리목적)</h3>
            <div className="space-y-3 text-gray-700">
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. 회원가입 및 관리</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>회원 가입의사 확인</li>
                  <li>회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>회원자격 유지·관리</li>
                  <li>서비스 부정이용 방지</li>
                  <li>각종 고지·통지</li>
                  <li>고충처리</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. 서비스 제공</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>네트워크 보안 분석 서비스 제공</li>
                  <li>분석 결과 저장 및 제공</li>
                  <li>맞춤형 서비스 제공</li>
                  <li>서비스 이용 통계 분석</li>
                  <li>커뮤니티 게시판 이용</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3. 고충처리</h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>민원인의 신원 확인</li>
                  <li>민원사항 확인</li>
                  <li>사실조사를 위한 연락·통지</li>
                  <li>처리결과 통보</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 제2조 개인정보의 처리 및 보유기간 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제2조 (개인정보의 처리 및 보유기간)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>1) 회원가입 및 관리</strong>
                    <p className="ml-4">보존항목: 이메일, 이름, 가입일시, 최종 로그인 일시</p>
                    <p className="ml-4">보존근거: 회원가입 및 관리</p>
                    <p className="ml-4">보존기간: 회원 탈퇴 시까지</p>
                  </div>
                  <div>
                    <strong>2) 서비스 이용 기록</strong>
                    <p className="ml-4">보존항목: 분석 기록, 접속 로그, 서비스 이용 기록</p>
                    <p className="ml-4">보존근거: 서비스 제공 및 개선</p>
                    <p className="ml-4">보존기간: 회원 탈퇴 후 1년</p>
                  </div>
                  <div>
                    <strong>3) 업로드 파일</strong>
                    <p className="ml-4">보존항목: 네트워크 설정 파일 내용</p>
                    <p className="ml-4">보존근거: 보안 분석 서비스 제공</p>
                    <p className="ml-4">보존기간: 분석 완료 즉시 삭제</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 제3조 개인정보의 제3자 제공 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제3조 (개인정보의 제3자 제공)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
              <p>2. 현재 회사는 개인정보를 제3자에게 제공하지 않습니다.</p>
              <p>3. 향후 개인정보를 제3자에게 제공할 필요가 있는 경우, 별도의 동의를 받겠습니다.</p>
            </div>
          </section>

          {/* 제4조 개인정보처리의 위탁 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제4조 (개인정보처리의 위탁)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">개인정보 처리 위탁 현황</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>1) Google Firebase</strong>
                    <p className="ml-4">위탁업무: 회원 인증, 데이터베이스 관리, 클라우드 호스팅</p>
                    <p className="ml-4">위탁기간: 서비스 종료 시까지</p>
                    <p className="ml-4">개인정보 보호 조치: 암호화 전송 및 저장, 접근 권한 제한</p>
                  </div>
                </div>
              </div>

              <p>2. 회사는 위탁계약 체결시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적․관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리․감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
            </div>
          </section>

          {/* 제5조 정보주체의 권리·의무 및 그 행사방법 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제5조 (정보주체의 권리·의무 및 그 행사방법)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
              
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>

              <p>2. 제1항에 따른 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
              
              <p>3. 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</p>
            </div>
          </section>

          {/* 제6조 처리하는 개인정보의 항목 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제6조 (처리하는 개인정보의 항목)</h3>
            <div className="space-y-3 text-gray-700">
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">1) 회원가입 및 관리</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>필수항목:</strong> 이메일, 비밀번호</p>
                  <p><strong>선택항목:</strong> 이름, 프로필 사진</p>
                  <p><strong>자동수집항목:</strong> IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <h4 className="font-semibold text-gray-900 mb-3">2) Google 소셜 로그인</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>수집항목:</strong> Google 계정 이메일, 이름, 프로필 사진</p>
                  <p><strong>수집목적:</strong> 간편 로그인 서비스 제공</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-3">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ 중요 안내</h4>
                <p className="text-sm text-yellow-800">업로드된 네트워크 설정 파일은 분석 완료 즉시 서버에서 완전히 삭제되며, 어떠한 형태로도 저장되지 않습니다. 단, 분석 결과 요약 정보만 암호화되어 개인 계정에 저장됩니다.</p>
              </div>
            </div>
          </section>

          {/* 제7조 개인정보의 파기 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제7조 (개인정보의 파기)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
              
              <p>2. 파기의 절차 및 방법은 다음과 같습니다:</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>1) 파기절차</strong>
                    <p className="ml-4">회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>
                  </div>
                  <div>
                    <strong>2) 파기방법</strong>
                    <p className="ml-4">- 전자적 파일 형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 완전삭제</p>
                    <p className="ml-4">- 종이 문서: 분쇄기로 분쇄하거나 소각</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 제8조 개인정보의 안전성 확보조치 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제8조 (개인정보의 안전성 확보조치)</h3>
            <div className="space-y-3 text-gray-700">
              <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
              
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>개인정보 취급 직원의 최소화 및 교육</strong><br />
                    <span className="text-sm">개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.</span></li>
                
                <li><strong>정기적인 자체 감사 실시</strong><br />
                    <span className="text-sm">개인정보 취급 관련 안정성 확보를 위해 정기적(분기 1회)으로 자체 감사를 실시하고 있습니다.</span></li>
                
                <li><strong>내부관리계획의 수립 및 시행</strong><br />
                    <span className="text-sm">개인정보의 안전한 처리를 위하여 내부관리계획을 수립하고 시행하고 있습니다.</span></li>
                
                <li><strong>개인정보의 암호화</strong><br />
                    <span className="text-sm">개인정보는 암호화 등을 통해 안전하게 저장 및 관리되고 있습니다. 또한 중요한 데이터는 저장 및 전송 시 암호화하여 사용하고 있습니다.</span></li>
                
                <li><strong>해킹 등에 대비한 기술적 대책</strong><br />
                    <span className="text-sm">해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</span></li>
                
                <li><strong>개인정보에 대한 접근 제한</strong><br />
                    <span className="text-sm">개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여,변경,말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</span></li>
                
                <li><strong>접속기록의 보관 및 위변조 방지</strong><br />
                    <span className="text-sm">개인정보처리시스템에 접속한 기록을 최소 6개월 이상 보관, 관리하고 있으며, 접속 기록이 위변조 및 도난, 분실되지 않도록 보안기능 사용하고 있습니다.</span></li>
              </ul>
            </div>
          </section>

          {/* 제9조 개인정보 보호책임자 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제9조 (개인정보 보호책임자)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">▶ 개인정보 보호책임자</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>성명:</strong> 개인정보보호책임자</p>
                  <p><strong>직책:</strong> 개발팀장</p>
                  <p><strong>연락처:</strong> privacy@netsecure.com, 1588-0000</p>
                </div>
              </div>

              <p>2. 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.</p>
            </div>
          </section>

          {/* 제10조 권익침해 구제방법 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제10조 (권익침해 구제방법)</h3>
            <div className="space-y-3 text-gray-700">
              <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다. 이 밖에 기타 개인정보침해의 신고, 상담에 대하여는 아래의 기관에 문의하시기 바랍니다.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>1. 개인정보분쟁조정위원회:</strong>
                    <p className="ml-4">(국번없이) 1833-6972 (www.kopico.go.kr)</p>
                  </div>
                  <div>
                    <strong>2. 개인정보침해신고센터:</strong>
                    <p className="ml-4">(국번없이) privacy.go.kr</p>
                  </div>
                  <div>
                    <strong>3. 대검찰청:</strong>
                    <p className="ml-4">(국번없이) 1301 (www.spo.go.kr)</p>
                  </div>
                  <div>
                    <strong>4. 경찰청:</strong>
                    <p className="ml-4">(국번없이) 182 (ecrm.cyber.go.kr)</p>
                  </div>
                </div>
              </div>

              <p>「개인정보보호법」제35조(개인정보의 열람), 제36조(개인정보의 정정·삭제), 제37조(개인정보의 처리정지 등)의 규정에 의한 요구에 대 하여 공공기관의 장이 행한 처분 또는 부작위로 인하여 권리 또는 이익의 침해를 받은 자는 행정심판법이 정하는 바에 따라 행정심판을 청구할 수 있습니다.</p>
            </div>
          </section>

          {/* 제11조 개인정보 처리방침 변경 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">제11조 (개인정보 처리방침 변경)</h3>
            <div className="space-y-3 text-gray-700">
              <p>1. 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              <p>2. 본 방침은 2025년 1월 1일부터 시행됩니다.</p>
            </div>
          </section>

          {/* 연락처 */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">개인정보 문의</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>서비스명:</strong> NetSecure 네트워크 보안 분석 서비스</p>
              <p><strong>개인정보보호책임자:</strong> 개발팀장</p>
              <p><strong>이메일:</strong> privacy@netsecure.com</p>
              <p><strong>고객센터:</strong> 1588-0000 (평일 09:00-18:00)</p>
              <p><strong>주소:</strong> 서울특별시 강남구 테헤란로 123, NetSecure Building</p>
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

export default PrivacyPolicy;