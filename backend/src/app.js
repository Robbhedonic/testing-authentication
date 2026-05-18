import 'dotenv/config';
import './firebase.js';
import express from 'express';
import cors from 'cors';
import gymsRouter from './routes/gyms.js';
import profileRouter from './routes/profile.js';

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(express.json());
app.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));

app.use('/gyms', gymsRouter);
app.use('/profile', profileRouter);

export default app;
