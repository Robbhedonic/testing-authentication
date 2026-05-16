# Gym Review API

A REST API with authentication, integration and unit tests, and a CI pipeline via GitHub Actions.

---

## Setup

### Clone the repository
```bash
git clone https://github.com/Robbhedonic/testing-authentication.git
cd testing-authentication
```

### Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Configure environment variables
Copy the example file and fill in your values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

See `.env.example` files for the required variables.

### Run the project locally
```bash
# Backend (runs on http://localhost:3000)
cd backend
npm start

# Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## Testing

### Run tests locally
```bash
# Backend integration tests
cd backend
npm test

# Frontend unit tests
cd frontend
npm test
```

### Screenshots
_Add screenshot of passing local tests here_

_Add screenshot of passing GitHub Actions pipeline here_

---

## Authentication

**Provider chosen: Firebase**

We chose Firebase because it provides token-based authentication that integrates cleanly with a REST API. The client authenticates directly with Firebase and receives a JWT (ID token). This token is sent in the `Authorization: Bearer <token>` header on every protected request.

### How it works
1. The user logs in via the frontend using Firebase Auth
2. Firebase returns an ID token
3. The frontend sends the token in the `Authorization` header
4. The backend `verifyToken` middleware calls `firebase-admin` to verify the token
5. If valid, the request proceeds; otherwise a `401 Unauthorized` is returned

---

## Security decisions

### No secrets in the repository
All API keys and credentials are stored in `.env` files which are listed in `.gitignore`. A `.env.example` file documents which variables are needed without exposing real values.

### Protected routes return 401
Unauthenticated requests to `POST /gyms`, `POST /gyms/:id/reviews`, and `GET /profile` return `401 Unauthorized`. This is verified by dedicated integration tests.

### CORS restricted to a specific origin
CORS is configured to only allow `http://localhost:5173` (the Vite dev server). A wildcard `*` is not used because that would allow any origin to make authenticated requests to the API.

### Tokens not stored in localStorage
Firebase tokens are kept in memory and not stored in `localStorage`. `localStorage` is accessible by JavaScript from any script on the page, making it vulnerable to XSS attacks.

### `withCredentials: true` on authenticated requests
All authenticated frontend requests use `withCredentials: true` so cookies and credentials are sent correctly with cross-origin requests.

---

## Reflections

### Implementation choices
- **In-memory array** for data storage — the focus of this project is testing and authentication, not database design. An in-memory store keeps the setup simple and makes tests fast and predictable.
- **Firebase** over Auth0 — token-based auth is a better fit for a stateless REST API. It avoids session management and works well with the `Authorization` header pattern.
- **Vitest** for both backend and frontend — consistent tooling across the project, fast execution, and native ES module support.

### What was challenging
- Mocking `firebase-admin` in integration tests so they can run without real Firebase credentials in CI.
- Configuring CORS correctly so the frontend can send authenticated requests with credentials.

### What we would do differently
- Use a real database (PostgreSQL or MongoDB) with migrations for a production-ready setup.
- Add refresh token handling on the frontend for longer sessions.
