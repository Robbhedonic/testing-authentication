import { Router } from 'express';
import verifyToken from '../middleware/verifyToken.js';

const router = Router();

// In-memory data store
const gyms = [
  { id: 1, name: 'Iron Paradise', location: 'Stockholm', reviews: [] },
  { id: 2, name: 'Gold\'s Gym', location: 'Gothenburg', reviews: [] },
];
let nextId = 3;

// GET /gyms — public
router.get('/', (req, res) => {
  res.json(gyms);
});

// GET /gyms/:id — public
router.get('/:id', (req, res) => {
  const gym = gyms.find(g => g.id === Number(req.params.id));
  if (!gym) return res.status(404).json({ error: 'Gym not found' });
  res.json(gym);
});

// POST /gyms — protected
router.post('/', verifyToken, (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'name and location are required' });
  }
  const gym = { id: nextId++, name, location, reviews: [] };
  gyms.push(gym);
  res.status(201).json(gym);
});

// POST /gyms/:id/reviews — protected
router.post('/:id/reviews', verifyToken, (req, res) => {
  const gym = gyms.find(g => g.id === Number(req.params.id));
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const { text, rating } = req.body;
  if (!text || !rating) {
    return res.status(400).json({ error: 'text and rating are required' });
  }
  const review = { text, rating, author: req.user.email };
  gym.reviews.push(review);
  res.status(201).json(review);
});

export { gyms };
export default router;
