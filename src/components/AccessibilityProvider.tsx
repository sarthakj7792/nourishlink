'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ContrastMode = 'normal' | 'high';
type ThemeMode = 'light' | 'dark';

interface AccessibilityContextType {
  contrast: ContrastMode;
  toggleContrast: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialisers read from localStorage once at mount — no cascading setState in an effect.
  const [contrast, setContrast] = useState<ContrastMode>(() => {
    if (typeof window === 'undefined') return 'normal';
    return (localStorage.getItem('nourishlink_contrast') as ContrastMode) || 'normal';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('nourishlink_theme') as ThemeMode) || 'light';
  });
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window === 'undefined') return 'normal';
    return (localStorage.getItem('nourishlink_fontsize') as 'normal' | 'large' | 'xlarge') || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (contrast === 'high') {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
    localStorage.setItem('nourishlink_contrast', contrast);
  }, [contrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nourishlink_theme', theme);
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('text-base', 'text-lg', 'text-xl');
    if (fontSize === 'large') body.classList.add('text-lg');
    else if (fontSize === 'xlarge') body.classList.add('text-xl');
    else body.classList.add('text-base');
    localStorage.setItem('nourishlink_fontsize', fontSize);
  }, [fontSize]);

  const toggleContrast = () => {
    setContrast((prev) => (prev === 'normal' ? 'high' : 'normal'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AccessibilityContext.Provider
      value={{
        contrast,
        toggleContrast,
        theme,
        toggleTheme,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
