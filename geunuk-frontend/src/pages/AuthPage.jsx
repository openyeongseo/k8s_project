import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../store';
import styles from './AuthPage.module.css';

const API = 'http://192.168.56.104:8080';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });

  const loginAs = async () => {
    if (!form.email || !form.password) {
      show('이메일과 비밀번호를 입력해주세요.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.message || '이메일 또는 비밀번호가 틀렸습니다.', 'error');
        return;
      }
      login({
        email: form.email,
        name: data.data?.name || form.email,
        accessToken: data.data?.accessToken,
        role: 'USER'
      });
      show('로그인되었습니다.');
      nav('/');
    } catch (e) {
      show('서버 오류가 발생했습니다.', 'error');
    }
  };

  const loginAdmin = () => {
    login({ name: '관리자', email: 'admin@musclecatch.kr', role: 'ADMIN' });
    show('관리자 계정으로 로그인했습니다.');
    nav('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.visual}>
        <div>
          <p>MUSCLE CATCH</p>
          <h2>운동을 고르는<br />새로운 기준</h2>
          <span>나의 체형과 목표에 맞춘 헬스 쇼핑</span>
        </div>
      </div>
      <section className={styles.box}>
        <div className={styles.brand}>근육캐치<small>MUSCLE CATCH</small></div>
        <h1>로그인</h1>
        <p className={styles.intro}>회원 혜택과 나만의 추천 상품을 확인하세요.</p>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input className="form-input" type="email" value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="example@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input className="form-input" type="password" value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
            placeholder="비밀번호를 입력하세요"
            onKeyDown={e => e.key === 'Enter' && loginAs()} />
        </div>
        <div className={styles.actionsText}>
          <label><input type="checkbox" /> 로그인 유지</label>
          <button>비밀번호 찾기</button>
        </div>
        <button className="btn-primary" onClick={loginAs}>로그인</button>
        <button className={styles.admin} onClick={loginAdmin}>관리자 체험 로그인</button>
        <div className={styles.divider}>소셜 로그인</div>
        <button className={styles.googleLogin} onClick={() => show('Google 소셜 로그인은 준비 중입니다.', 'error')}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google로 로그인
        </button>
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

  const join = async () => {
    if (!form.name || !form.email || !form.password || !form.agreed) {
      show('필수 정보와 약관 동의를 확인해주세요.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        show(data.message || '회원가입에 실패했습니다.', 'error');
        return;
      }
      login({ name: form.name, email: form.email, point: 100000, role: 'USER' });
      show('가입 완료! 신규 가입 포인트 100,000P가 지급되었습니다.');
      nav('/mypage');
    } catch (e) {
      show('서버 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className={styles.signupPage}>
      <section className={`${styles.box} ${styles.signup}`}>
        <div className={styles.brand}>근육캐치<small>MUSCLE CATCH</small></div>
        <h1>회원가입</h1>
        <p className={styles.benefit}>가입 즉시 <b>100,000P</b> 지급</p>
        {[['name','이름','text','이름을 입력하세요'],
          ['email','이메일','email','example@email.com'],
          ['password','비밀번호','password','8자 이상 입력하세요'],
          ['phone','휴대폰 번호','text','010-0000-0000']
        ].map(([key, label, type, ph]) =>
          <div className="form-group" key={key}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type} placeholder={ph}
              value={form[key]}
              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} />
          </div>
        )}
        <label className={styles.agree}>
          <input type="checkbox" checked={form.agreed}
            onChange={e => setForm(prev => ({ ...prev, agreed: e.target.checked }))} />
          이용약관 및 개인정보 처리방침에 동의합니다.
        </label>
        <button className="btn-primary" onClick={join}>가입하고 포인트 받기</button>
        <p className={styles.switch}>이미 회원이신가요? <button onClick={() => nav('/login')}>로그인</button></p>
      </section>
    </div>
  );
}
