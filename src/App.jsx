
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import { InternetProvider } from "./contexts/InternetContext";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Forms from "./pages/Forms";
import Websites from "./pages/Websites";
import Migration from "./pages/Migration";
import { Spin } from "antd";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/forms" replace />} />
        <Route path="forms" element={<Forms />} />
        <Route path="websites" element={<Websites />} />
        <Route path="migration" element={<Migration />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <ErrorProvider>
        <InternetProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </InternetProvider>
      </ErrorProvider>
    </Router>
  );
};

export default App;
