import { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { STORAGE_KEYS } from '../util/constant/CONSTANTS';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const antdConfig = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#0ea5e9',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#0ea5e9',
      borderRadius: 8,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={antdConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
