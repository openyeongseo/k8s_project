import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER } from '../data/mock';
import { useAuth, useToast } from '../store';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });

  const loginAs = role => {
    if (role === 'USER' && (!form.email || !form.password)) { show('이메일과 비밀번호를 입력해주세요.', 'error'); return; }
    const member = role === 'ADMIN' ? { ...MOCK_USER, name: '관리자', email: 'admin@musclecatch.kr', role: 'ADMIN' } : { ...MOCK_USER, email: form.email || MOCK_USER.email, role: 'USER' };
    login(member); show(role === 'ADMIN' ? '관리자 계정으로 로그인했습니다.' : '로그인되었습니다.'); nav('/');
  };
  const social = provider => { login({ ...MOCK_USER, role: 'USER' }); show(`${provider} 계정이 연동되었습니다.`); nav('/'); };

  return (
    <div className={styles.page}>
      <div className={styles.visual}><div><p>MUSCLE CATCH</p><h2>운동을 고르는<br />새로운 기준</h2><span>나의 체형과 목표에 맞춘 헬스 쇼핑</span></div></div>
      <section className={styles.box}>
        <div className={styles.brand}>근육캐치<small>MUSCLE CATCH</small></div>
        <h1>로그인</h1><p className={styles.intro}>회원 혜택과 나만의 추천 상품을 확인하세요.</p>
        <div className="form-group"><label className="form-label">이메일</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="example@email.com" /></div>
        <div className="form-group"><label className="form-label">비밀번호</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} placeholder="비밀번호를 입력하세요" onKeyDown={e => e.key === 'Enter' && loginAs('USER')} /></div>
        <div className={styles.actionsText}><label><input type="checkbox" /> 로그인 유지</label><button>비밀번호 찾기</button></div>
        <button className="btn-primary" onClick={() => loginAs('USER')}>로그인</button>
        <button className={styles.admin} onClick={() => loginAs('ADMIN')}>관리자 체험 로그인</button>
        <div className={styles.divider}>소셜 로그인</div>
        <div className={styles.social}><button className={styles.google} onClick={() => social('Google')}>G</button><button className={styles.naver} onClick={() => social('Naver')}>N</button><button className={styles.kakao} onClick={() => social('Kakao')}>K</button></div>
        <p className={styles.switch}>아직 회원이 아니신가요? <button onClick={() => nav('/signup')}>회원가입</button></p>
      </section>
    </div>
  );
}

export function SignupPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', agreed: false });
  const join = () => {
    if (!form.name || !form.email || !form.password || !form.agreed) { show('필수 정보와 약관 동의를 확인해주세요.', 'error'); return; }
    login({ ...MOCK_USER, name: form.name, email: form.email, phone: form.phone, point: 100000, role: 'USER' });
    show('가입 완료! 신규 가입 포인트 100,000P가 지급되었습니다.'); nav('/mypage');
  };
  return (
    <div className={styles.signupPage}>
      <section className={`${styles.box} ${styles.signup}`}>
        <div className={styles.brand}>근육캐치<small>MUSCLE CATCH</small></div>
        <h1>회원가입</h1><p className={styles.benefit}>가입 즉시 <b>100,000P</b> 지급</p>
        {[['name','이름','text','이름을 입력하세요'], ['email','이메일','email','example@email.com'], ['password','비밀번호','password','8자 이상 입력하세요'], ['phone','휴대폰 번호','text','010-0000-0000']].map(([key, label, type, ph]) => <div className="form-group" key={key}><label className="form-label">{label}</label><input className="form-input" type={type} placeholder={ph} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} /></div>)}
        <label className={styles.agree}><input type="checkbox" checked={form.agreed} onChange={e => setForm(prev => ({ ...prev, agreed: e.target.checked }))} /> 이용약관 및 개인정보 처리방침에 동의합니다.</label>
        <button className="btn-primary" onClick={join}>가입하고 포인트 받기</button>
        <p className={styles.switch}>이미 회원이신가요? <button onClick={() => nav('/login')}>로그인</button></p>
      </section>
    </div>
  );
}

