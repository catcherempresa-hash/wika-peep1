import { useNavigate } from 'react-router-dom';
import { auth, isFirebaseConfigured } from '../firebase';
import { signOut } from 'firebase/auth';

import logoWika from '../assets/logo-wika.png';
import { getUserDisplayName } from '../utils/userDisplayName';

interface Props {
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function Navbar({ subtitle, showBack, backTo, backLabel }: Props) {
  const navigate = useNavigate();
  const user = isFirebaseConfigured
    ? auth?.currentUser
    : { email: localStorage.getItem('wika_mock_session') || 'operador@wika.com' };

  const displayName = getUserDisplayName(user?.email);

  async function handleLogout() {
    if (!isFirebaseConfigured) {
      localStorage.removeItem('wika_mock_session');
      navigate('/');
      return;
    }
    if (auth) {
      await signOut(auth);
    }
    navigate('/');
  }

  function handleBack() {
    if (backTo) navigate(backTo);
    else navigate(-1);
  }

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <img src={logoWika} alt="WIKA" style={{ height: '100px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        {subtitle && (
          <>
            <div className="navbar-logo-divider" />
            <span className="navbar-logo-text">{subtitle}</span>
          </>
        )}
      </div>

      <div className="navbar-user">
        {showBack && (
          <button className="btn btn-ghost btn-sm" onClick={handleBack} style={{ color: 'rgba(255,255,255,0.8)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {backLabel || 'Voltar'}
          </button>
        )}
        {user && (
          <>
            <span className="navbar-user-name">{displayName}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              title="Sair"
              style={{ color: 'rgba(255,255,255,0.7)', padding: '6px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
