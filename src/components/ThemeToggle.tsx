'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('utsava-theme') as 'dark' | 'light' | null;
    const initial = saved ?? 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('utsava-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      style={{ padding: '8px 12px' }}
      id="btn-theme-toggle"
    >
      {theme === 'dark' ? (
        <Sun size={18} color="var(--accent-gold)" aria-hidden="true" />
      ) : (
        <Moon size={18} color="var(--accent-gold)" aria-hidden="true" />
      )}
      <span style={{ fontSize: '0.85rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
