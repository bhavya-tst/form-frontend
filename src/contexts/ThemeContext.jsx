import { createContext, useContext, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Always set dark mode
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

  // Dark mode configuration only
  const antdConfig = {
    algorithm: antdTheme.darkAlgorithm,
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
    <ThemeContext.Provider value={{ isDark: true }}>
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
