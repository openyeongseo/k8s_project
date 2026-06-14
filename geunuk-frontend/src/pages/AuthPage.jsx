import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../store';
import styles from './AuthPage.module.css';

const GOOGLE_CLIENT_ID = '432897033576-aq8h3043q9159rklpkoire5okh1r55ku.apps.googleusercontent.com';

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const API = '/api/auth';

function useGoogleLogin(onSuccess, onError) {
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await fetch(`${API}/oauth2/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: response.credential })
            });
            const data = await res.json();
            if (!res.ok) { onError(data.message || '구글 로그인 실패'); return; }
            onSuccess(data.data);
          } catch {
            onError('서버 오류가 발생했습니다.');
          }
        }
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) { initGoogle(); clearInterval(interval); }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onSuccess, onError]);

  const openPopup = () => {
    if (!window.google) { onError('Google 로그인을 불러오는 중입니다. 잠시 후 다시 시도해주세요.'); return; }
    window.google.accounts.id.prompt();
  };

  return { openPopup };
}

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGoogleSuccess = (data) => {
    login({
      id: data?.userId,
      name: data?.username || '구글 사용자',
      email: data?.email || '',
      accessToken: data?.accessToken,
      role: 'USER'
    });
    show('구글 로그인되었습니다.');
    nav('/');
  };

  const { openPopup } = useGoogleLogin(handleGoogleSuccess, (msg) => show(msg, 'error'));

  const loginAs = async () => {
    if (!form.email || !form.password) { show('이메일과 비밀번호를 입력해주세요.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) { show(data.message || '이메일 또는 비밀번호가 틀렸습니다.', 'error'); return; }
      login({
        id: data.data?.userId,
        name: data.data?.username || form.email.split('@')[0],
        email: form.email,
        accessToken: data.data?.accessToken,
        role: 'USER'
      });
      show('로그인되었습니다.');
      nav('/');
    } catch { show('서버 오류가 발생했습니다.', 'error'); }
    finally { setLoading(false); }
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
        <button className={styles.googleLogin} onClick={openPopup}>
          {GOOGLE_ICON} Google로 로그인
        </button>
        <div className={styles.divider}><span>또는</span></div>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={set} placeholder="example@email.com" onKeyDown={e => e.key === 'Enter' && loginAs()} />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={set} placeholder="비밀번호를 입력하세요" onKeyDown={e => e.key === 'Enter' && loginAs()} />
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={loginAs} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
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
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const set = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGoogleSuccess = (data) => {
    login({
      id: data?.userId,
      name: data?.username || '구글 사용자',
      email: data?.email || '',
      accessToken: data?.accessToken,
      role: 'USER'
    });
    show('구글로 가입/로그인되었습니다. 100,000P가 지급되었습니다.');
    nav('/');
  };

  const { openPopup } = useGoogleLogin(handleGoogleSuccess, (msg) => show(msg, 'error'));

  const join = async () => {
    if (!form.name || !form.email || !form.password) { show('이름, 이메일, 비밀번호를 입력해주세요.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      });
      const data = await res.json();
      if (!res.ok) { show(data.message || '회원가입 실패', 'error'); return; }
      login({ name: form.name, email: form.email, role: 'USER' });
      show('회원가입이 완료되었습니다. 100,000P가 지급되었습니다.');
      nav('/mypage');
    } catch { show('서버 오류가 발생했습니다.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.signupPage}>
      <section className={`${styles.box} ${styles.signup}`}>
        <div className={styles.brand}>근육캐치<small>MUSCLE CATCH</small></div>
        <h1>회원가입</h1>
        <p className={styles.benefit}>가입 즉시 <b>100,000P</b> 지급</p>
        <button className={styles.googleLogin} onClick={openPopup}>
          {GOOGLE_ICON} Google로 가입하기
        </button>
        <div className={styles.divider}><span>또는</span></div>
        <div className="form-group">
          <label className="form-label">이름</label>
          <input className="form-input" type="text" name="name" value={form.name} onChange={set} placeholder="이름을 입력하세요" />
        </div>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={set} placeholder="example@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={set} placeholder="비밀번호를 입력하세요" />
        </div>
        <div className="form-group">
          <label className="form-label">휴대폰 <small style={{color:'var(--txt3)'}}>(선택)</small></label>
          <input className="form-input" type="text" name="phone" value={form.phone} onChange={set} placeholder="010-0000-0000" />
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={join} disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
        <p className={styles.switch}>이미 회원이신가요? <button onClick={() => nav('/login')}>로그인</button></p>
      </section>
    </div>
  );
}
