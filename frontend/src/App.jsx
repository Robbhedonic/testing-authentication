import { useEffect, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import './App.css';
import { auth, hasRequiredFirebaseConfig, provider } from './firebase';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [gyms, setGyms] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(false);
  const [gymsError, setGymsError] = useState('');

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [gymFormError, setGymFormError] = useState('');
  const [gymFormLoading, setGymFormLoading] = useState(false);

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
        .catch(() => setProfileError('Could not load profile.'));
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
    } catch {
      setGymFormError('Could not add gym. Make sure name and location are filled.');
    } finally {
      setGymFormLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="auth-shell">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <header className="app-header">
          <h1>Gym Review API</h1>
          {!hasRequiredFirebaseConfig && (
            <p className="warning">Configure frontend .env values before logging in.</p>
          )}
          <div className="actions">
            {!user ? (
              <button type="button" onClick={handleLogin} disabled={!hasRequiredFirebaseConfig}>
                Login with Google
              </button>
            ) : (
              <button type="button" className="secondary" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </header>

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
          <h2>Gyms</h2>
          {gymsLoading && <p>Loading gyms...</p>}
          {gymsError && <p className="error">{gymsError}</p>}
          {!gymsLoading && !gymsError && gyms.length === 0 && <p>No gyms available.</p>}
          {gyms.length > 0 && (
            <ul>
              {gyms.map((gym) => (
                <li key={gym.id}>
                  <strong>{gym.name}</strong> — {gym.location}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add gym form — protected (only when logged in) */}
        {user && (
          <section className="gym-form">
            <h2>Add a Gym</h2>
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
                {gymFormLoading ? 'Adding...' : 'Add Gym'}
              </button>
            </form>
            {gymFormError && <p className="error">{gymFormError}</p>}
          </section>
        )}

        {!user && (
          <p className="hint">Log in to add gyms and write reviews.</p>
        )}
      </section>
    </main>
  );
}

export default App;
