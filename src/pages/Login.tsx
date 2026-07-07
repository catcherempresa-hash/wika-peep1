import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';
import logoWika from '../assets/logo-wika.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    setError('');

    if (!isFirebaseConfigured) {
      // Offline/Demo mock login
      setTimeout(() => {
        localStorage.setItem('wika_mock_session', email);
        setLoading(false);
        navigate('/estacoes');
      }, 500);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email.trim().toLowerCase() === 'teste@wika.com') {
        localStorage.setItem('wika_mock_session', email);
      }
      navigate('/estacoes');
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos. Verifique as credenciais e tente novamente.');
      } else if (code === 'auth/invalid-email') {
        setError('Formato de e-mail inválido.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else if (code === 'auth/network-request-failed') {
        setError('Sem conexão. Verifique a internet e tente novamente.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="login-card">
        {/* Logo WIKA */}
        <div style={{
          textAlign: 'center',
          marginBottom: 12,
          height: '100px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={logoWika}
            className="login-logo"
            alt="WIKA"
            style={{
              height: '260px',
              width: 'auto',
              display: 'block',
              margin: '0 auto',
              objectFit: 'contain'
            }}
          />
        </div>

        <div className="login-bar" />

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-subtitle">Endereçamento - Expedição</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="operador@wika.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="field mt-16">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert alert-error mt-16" role="alert">
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full mt-24"
            disabled={loading}
          >
            {loading ? <><span className="spinner" />Entrando…</> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
