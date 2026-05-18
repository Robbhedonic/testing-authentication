import admin from 'firebase-admin';

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const hasFirebaseAdminConfig =
  Boolean(FIREBASE_PROJECT_ID) &&
  Boolean(FIREBASE_CLIENT_EMAIL) &&
  Boolean(FIREBASE_PRIVATE_KEY);

const isFirebaseAdminReady = () => admin.apps.length > 0;

const ensureFirebaseAdminApp = (projectId) => {
  if (admin.apps.length > 0) {
    return;
  }

  if (hasFirebaseAdminConfig) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      return;
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          '[auth] Firebase private key is invalid. Falling back to projectId-only initialization:',
          error?.message || 'unknown'
        );
      }
    }
  }

  const fallbackProjectId = projectId || FIREBASE_PROJECT_ID;
  if (fallbackProjectId) {
    admin.initializeApp({ projectId: fallbackProjectId });
  }
};

ensureFirebaseAdminApp(FIREBASE_PROJECT_ID);

if (!isFirebaseAdminReady() && process.env.NODE_ENV !== 'test') {
  console.warn(
    '[auth] Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env'
  );
}

export default admin;
export { ensureFirebaseAdminApp, hasFirebaseAdminConfig, isFirebaseAdminReady };
