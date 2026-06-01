import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import PublicList from './pages/PublicList';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Story from './pages/Story';
import ResetPassword from './pages/ResetPassword';

const VALID_ROLES = ['noivo', 'gestor'];

function PrivateRoute({ children, role }) {
  const { currentUser, sessionChecked, logout } = useStore();
  if (!sessionChecked) return null;
  if (!currentUser || !VALID_ROLES.includes(currentUser.role)) {
    if (currentUser) logout();
    return <Navigate to="/auth" replace />;
  }
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'gestor' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  const loadSession = useStore((state) => state.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/lista" element={<PublicList />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/dashboard" element={
          <PrivateRoute role="noivo"><Dashboard /></PrivateRoute>
        } />
        <Route path="/catalogo" element={
          <PrivateRoute role="noivo"><Catalog /></PrivateRoute>
        } />
        <Route path="/story" element={
          <PrivateRoute><Story /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute role="gestor"><Admin /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
