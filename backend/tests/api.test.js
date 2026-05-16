import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  verifyIdTokenMock: vi.fn(),
}));

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifyIdToken: hoisted.verifyIdTokenMock,
    }),
  },
}));

const { default: app } = await import('../src/app.js');
const { gyms } = await import('../src/routes/gyms.js');

beforeEach(() => {
  gyms.length = 0;
  gyms.push(
    { id: 1, name: 'Iron Paradise', location: 'Stockholm', reviews: [] },
    { id: 2, name: "Gold's Gym", location: 'Gothenburg', reviews: [] }
  );

  hoisted.verifyIdTokenMock.mockReset();
  hoisted.verifyIdTokenMock.mockResolvedValue({
    uid: 'user-1',
    email: 'user@test.com',
    name: 'Test User',
  });
});

describe('Gym API integration', () => {
  it('GET /gyms returns 200 and an array', async () => {
    const res = await request(app).get('/gyms');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('GET /gyms/:id returns 404 for unknown gym', async () => {
    const res = await request(app).get('/gyms/9999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Gym not found');
  });

  it('POST /gyms returns 401 without token', async () => {
    const res = await request(app).post('/gyms').send({
      name: 'New Gym',
      location: 'Malmo',
    });

    expect(res.status).toBe(401);
  });

  it('POST /gyms returns 201 with valid token', async () => {
    const res = await request(app)
      .post('/gyms')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: 'New Gym', location: 'Malmo' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'New Gym', location: 'Malmo' });
  });

  it('POST /gyms/:id/reviews returns 401 without token', async () => {
    const res = await request(app).post('/gyms/1/reviews').send({
      text: 'Great place',
      rating: 5,
    });

    expect(res.status).toBe(401);
  });

  it('GET /profile returns 401 without token', async () => {
    const res = await request(app).get('/profile');

    expect(res.status).toBe(401);
  });
});
