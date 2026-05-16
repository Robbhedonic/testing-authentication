import express from 'express';
import cors from 'cors';
import gymsRouter from './routes/gyms.js';
import profileRouter from './routes/profile.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/gyms', gymsRouter);
app.use('/profile', profileRouter);

export default app;
