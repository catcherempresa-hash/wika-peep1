import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

import Login from './pages/Login';
import SelectStation from './pages/SelectStation';
import Embalagem from './pages/Embalagem';
import Saida from './pages/Saida';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | 'loading'>('loading');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const session = localStorage.getItem('wika_mock_session');
      setUser(session ? ({ email: session } as User) : null);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  if (user === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-alt)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner spinner-blue" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verificando sessão…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/estacoes" element={<ProtectedRoute><SelectStation /></ProtectedRoute>} />
        <Route path="/embalagem" element={<ProtectedRoute><Embalagem /></ProtectedRoute>} />
        <Route path="/saida" element={<ProtectedRoute><Saida /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
