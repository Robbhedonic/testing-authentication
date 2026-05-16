import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import './App.css';
import { auth, hasRequiredFirebaseConfig, provider } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [tokenPreview, setTokenPreview] = useState('');
  const [status, setStatus] = useState(
    auth ? 'Checking session...' : 'Missing Firebase environment variables.'
  );

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setTokenPreview('');
        setStatus('Not logged in');
        return;
      }

      try {
        const token = await nextUser.getIdToken();
        setTokenPreview(`${token.slice(0, 22)}...`);
        setStatus('Logged in');
      } catch {
        setStatus('Logged in, but token could not be loaded');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) return;

    try {
      setStatus('Opening Google login...');
      await signInWithPopup(auth, provider);
    } catch {
      setStatus('Login failed');
    }
  };

  const handleLogout = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      setStatus('Not logged in');
    } catch {
      setStatus('Logout failed');
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Gym Review Login</h1>
        <p className="subtitle">Firebase authentication for protected API routes</p>

        {!hasRequiredFirebaseConfig ? (
          <p className="warning">
            Configure frontend .env values before logging in.
          </p>
        ) : null}

        <div className="actions">
          <button type="button" onClick={handleLogin} disabled={!hasRequiredFirebaseConfig}>
            Login with Google
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleLogout}
            disabled={!user}
          >
            Logout
          </button>
        </div>

        <p className="status">Status: {status}</p>

        {user ? (
          <section className="user-box">
            <h2>Current user</h2>
            <p>Name: {user.displayName || 'No display name'}</p>
            <p>Email: {user.email || 'No email'}</p>
            <p>UID: {user.uid}</p>
            <p>Token preview: {tokenPreview || 'Unavailable'}</p>
          </section>
        ) : (
          <section className="user-box">
            <h2>Current user</h2>
            <p>Not logged in.</p>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
