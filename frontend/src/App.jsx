import { useEffect, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import './App.css';
import { auth, hasRequiredFirebaseConfig, provider } from './firebase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState('welcome');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [gyms, setGyms] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [gymsError, setGymsError] = useState('');

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [gymFormError, setGymFormError] = useState('');
  const [gymFormLoading, setGymFormLoading] = useState(false);

  const profileName = profile?.name || user?.displayName || user?.email || 'Athlete';
  const currentView = user ? 'dashboard' : view;

  const getApiErrorMessage = (error, fallbackMessage) => {
    const serverMessage = error?.response?.data?.error;
    return typeof serverMessage === 'string' && serverMessage.trim().length > 0
      ? serverMessage
      : fallbackMessage;
  };

  // Auth state listener
  useEffect(() => {
    if (!auth) {
      // defer to avoid setState-in-effect lint error
      Promise.resolve().then(() => setAuthLoading(false));
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load public gyms list
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/gyms`)
      .then((res) => { if (!cancelled) { setGyms(res.data); setGymsError(''); setGymsLoading(false); } })
      .catch(() => { if (!cancelled) { setGymsError('Could not load gyms.'); setGymsLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // Load profile when user logs in
  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => { setProfile(null); setProfileError(''); });
      return;
    }
    user.getIdToken().then((token) => {
      axios
        .get(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        .then((res) => {
          setProfile(res.data);
          setProfileError('');
        })
        .catch((error) =>
          setProfileError(getApiErrorMessage(error, 'Could not load profile.'))
        );
    });
  }, [user]);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, provider);
    } catch {
      // login cancelled or failed — silently ignore
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setView('login');
  };

  const handleAddGym = async (e) => {
    e.preventDefault();
    if (!user) return;
    setGymFormLoading(true);
    setGymFormError('');
    try {
      const token = await user.getIdToken();
      const res = await axios.post(
        `${API}/gyms`,
        { name: newGymName, location: newGymLocation },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setGyms((prev) => [...prev, res.data]);
      setNewGymName('');
      setNewGymLocation('');
    } catch (error) {
      setGymFormError(getApiErrorMessage(error, 'Could not add gym.'));
    } finally {
      setGymFormLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="app-shell">
        <p>Loading...</p>
      </main>
    );
  }

  if (currentView === 'welcome') {
    return (
      <main className="app-shell">
        <section className="welcome-card">
          <p className="eyebrow">Gym Review Hub</p>
          <h1>Your progress starts here</h1>
          <p className="lead">
            Discover gyms, save your favorites, and build your routine with a
            results-focused community.
          </p>
          <div className="welcome-highlights">
            <article>
              <h2>Explore quickly</h2>
              <p>Check locations and gym details without signing in.</p>
            </article>
            <article>
              <h2>Secure profile</h2>
              <p>Sign in with Google to publish gyms and manage your space.</p>
            </article>
            <article>
              <h2>Personal session</h2>
              <p>View account data and create protected content.</p>
            </article>
          </div>
          <button
            type="button"
            className="cta"
            onClick={() => setView('login')}
          >
            Start now
          </button>
        </section>
      </main>
    );
  }

  if (currentView === 'login') {
    return (
      <main className="app-shell">
        <section className="login-card">
          <div className="login-pane">
            <p className="eyebrow">Access</p>
            <h1>Sign in to continue</h1>
            <p>
              Connect your Google account to access your profile, publish gyms,
              and keep your activity protected.
            </p>
            {!hasRequiredFirebaseConfig && (
              <p className="warning">Configure frontend .env before signing in.</p>
            )}
            <div className="actions">
              <button
                type="button"
                className="cta"
                onClick={handleLogin}
                disabled={!hasRequiredFirebaseConfig}
              >
                Sign in with Google
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => setView('welcome')}
              >
                Back
              </button>
            </div>
          </div>

          <aside className="feature-pane">
            <h2>Includes</h2>
            <ul>
              <li>Token-based authentication with Firebase</li>
              <li>Protected routes for profile and gym creation</li>
              <li>Real-time API synchronization</li>
              <li>Secure sign-out whenever you choose</li>
            </ul>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="dashboard-card">
        <header className="app-header">
          <p className="eyebrow">Active session</p>
          <h1>Welcome, {profileName}</h1>
          <p className="lead">Manage your profile and share new gyms with the community.</p>
          <div className="actions">
            <button type="button" className="ghost" onClick={() => setView('welcome')}>
              Go to home
            </button>
            <button type="button" className="secondary" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <section className="stats-grid" aria-label="session-metrics">
          <article>
            <p className="stat-label">Registered gyms</p>
            <p className="stat-value">{gyms.length}</p>
          </article>
          <article>
            <p className="stat-label">Profile status</p>
            <p className="stat-value">{profile ? 'Verified' : profileError ? 'Error' : 'Loading'}</p>
          </article>
          <article>
            <p className="stat-label">Access</p>
            <p className="stat-value">Protected</p>
          </article>
        </section>

        {/* Profile — only when logged in */}
        {user && (
          <section className="user-box">
            <h2>Profile</h2>
            {profileError ? (
              <p className="error">{profileError}</p>
            ) : profile ? (
              <>
                <p>Name: {profile.name}</p>
                <p>Email: {profile.email}</p>
                <p>UID: {profile.uid}</p>
              </>
            ) : (
              <p>Loading profile...</p>
            )}
          </section>
        )}

        {/* Gym list — public */}
        <section className="gym-list">
          <h2>Available gyms</h2>
          {gymsLoading && <p>Loading gyms...</p>}
          {gymsError && <p className="error">{gymsError}</p>}
          {!gymsLoading && !gymsError && gyms.length === 0 && <p>No gyms available yet.</p>}
          {gyms.length > 0 && (
            <ul>
              {gyms.map((gym) => (
                <li key={gym.id}>
                  <strong>{gym.name}</strong> - {gym.location}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add gym form — protected (only when logged in) */}
        {user && (
          <section className="gym-form">
            <h2>Publish a gym</h2>
            <form aria-label="add-gym-form" onSubmit={handleAddGym}>
              <input
                type="text"
                placeholder="Gym name"
                value={newGymName}
                onChange={(e) => setNewGymName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={newGymLocation}
                onChange={(e) => setNewGymLocation(e.target.value)}
                required
              />
              <button type="submit" disabled={gymFormLoading}>
                {gymFormLoading ? 'Publishing...' : 'Add gym'}
              </button>
            </form>
            {gymFormError && <p className="error">{gymFormError}</p>}
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
