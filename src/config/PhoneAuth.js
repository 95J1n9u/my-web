import React, { useState } from 'react';
import { auth, db } from './firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';


function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth, // ✅ auth 인스턴스가 첫 번째
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      }
    );
  }
};

  // 가입되어 있는지 휴대폰 번호 중복 체크
  const checkPhoneNumberExists = async (phoneNumber) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // 이미 존재하면 true
  };

  const sendCode = async () => {
    setupRecaptcha();
    try {
      const exists = await checkPhoneNumberExists(phoneNumber);
      if (exists) {
        alert('이미 가입된 번호입니다.');
        return;
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert('인증 코드가 발송되었습니다.');
    } catch (error) {
      console.error('SMS 인증 실패:', error);
      alert(error.message);
    }
  };

  const verifyCode = async () => {
    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      console.log('인증 성공:', user);
      alert('인증 성공!');

      // Firestore에 사용자 정보 저장
      const userDoc = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        createdAt: new Date()
      };
      await setDoc(doc(db, 'users', user.uid), userDoc);

    } catch (error) {
      console.error('인증 실패:', error);
      alert('인증 실패: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Phone Authentication</h2>
      <input
        type="text"
        placeholder="휴대폰 번호 (+821012345678)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={sendCode}>인증번호 받기</button>

      <br /><br />

      <input
        type="text"
        placeholder="인증 코드"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={verifyCode}>코드 확인</button>

      {/* Invisible reCAPTCHA 컨테이너 */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PhoneAuth;
