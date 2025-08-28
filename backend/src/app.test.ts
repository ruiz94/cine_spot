import request from 'supertest';
import app from './app';

describe('API routes', () => {
  it('should return 200 on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok...');
  });
});
