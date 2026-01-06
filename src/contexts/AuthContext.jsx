import { createContext, useContext, useState, useEffect } from 'react';
import { authStorage } from '../util/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authStorage.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (secret) => {
    authStorage.setSecret(secret);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authStorage.removeSecret();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
