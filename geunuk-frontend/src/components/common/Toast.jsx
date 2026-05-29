import React from 'react';
import { useToast } from '../../store';
import styles from './Toast.module.css';

export default function Toast() {
  const { toasts } = useToast();
  return (
    <div className={styles.wrap}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>{t.msg}</div>
      ))}
    </div>
  );
}
