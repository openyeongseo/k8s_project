import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../store';
import { MOCK_USER } from '../data/mock';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });

  const handle = () => {
    if (!form.email || !form.password) { show('이메일과 비밀번호를 입력해주세요.', 'error'); return; }
    login(MOCK_USER);
    show('로그인되었습니다! 🎉');
    nav('/');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.logo}>GEUNUK</div>
        <h2 className={styles.title}>LOGIN</h2>
        <p className={styles.sub}>근육캐치에 오신 것을 환영합니다</p>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input className="form-input" type="email" placeholder="example@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handle}>로그인</button>
        <div className={styles.divider}>또는 소셜 로그인</div>
        <div className={styles.social}>
          <button className={styles.naver} onClick={() => { login(MOCK_USER); show('네이버로 로그인되었습니다!'); nav('/'); }}>
            <span className={styles.naverN}>N</span> 네이버로 로그인
          </button>
          <button className={styles.kakao} onClick={() => { login(MOCK_USER); show('카카오로 로그인되었습니다!'); nav('/'); }}>
            <span>💬</span> 카카오로 로그인
          </button>
        </div>
        <div className={styles.switch}>
          계정이 없으신가요? <span onClick={() => nav('/signup')}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handle = () => {
    if (!form.name || !form.email || !form.password) { show('필수 항목을 모두 입력해주세요.', 'error'); return; }
    login({ ...MOCK_USER, name: form.name, email: form.email });
    show('회원가입 완료! 100,000P가 지급되었습니다. 🎉');
    nav('/');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.logo}>GEUNUK</div>
        <h2 className={styles.title}>JOIN</h2>
        <p className={styles.sub}>가입 즉시 <b style={{ color: 'var(--acc)' }}>100,000P</b> 자동 지급!</p>
        {[
          { key: 'name',     label: '이름',     type: 'text',     ph: '홍길동' },
          { key: 'email',    label: '이메일',   type: 'email',    ph: 'example@email.com' },
          { key: 'password', label: '비밀번호', type: 'password', ph: '8자 이상' },
          { key: 'phone',    label: '휴대폰',   type: 'text',     ph: '010-0000-0000' },
        ].map(f => (
          <div key={f.key} className="form-group">
            <label className="form-label">{f.label}</label>
            <input className="form-input" type={f.type} placeholder={f.ph}
              value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handle}>가입하기</button>
        <div className={styles.switch}>
          이미 계정이 있으신가요? <span onClick={() => nav('/login')}>로그인</span>
        </div>
      </div>
    </div>
  );
}
