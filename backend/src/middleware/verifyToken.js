import admin, { ensureFirebaseAdminApp, isFirebaseAdminReady } from '../firebase.js';

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  if (!isFirebaseAdminReady()) {
    const payload = decodeJwtPayload(token);
    const projectId = typeof payload?.aud === 'string' ? payload.aud : undefined;
    ensureFirebaseAdminApp(projectId);
  }

  if (!isFirebaseAdminReady()) {
    return res.status(500).json({
      error: 'Auth service is not configured on the server',
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[auth] Token verification failed:', error?.message || 'unknown');
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export default verifyToken;
