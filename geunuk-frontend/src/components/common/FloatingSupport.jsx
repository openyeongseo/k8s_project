import React from 'react';
import { useToast } from '../../store';
import styles from './FloatingSupport.module.css';

export default function FloatingSupport() {
  const { show } = useToast();
  return (
    <aside className={styles.float} aria-label="고객 지원">
      <button onClick={() => show('채팅 상담 기능은 백엔드 연동 예정입니다.', 'info')} aria-label="상담 문의">💬</button>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로">↑</button>
    </aside>
  );
}
