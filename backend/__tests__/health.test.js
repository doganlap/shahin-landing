const request = require('supertest');
const app = require('../server');

describe('Health Check Endpoint', () => {
  it('should return healthy status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Shahin GRC Backend API');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('AI Health Endpoint', () => {
  it('should return AI service status', async () => {
    const res = await request(app)
      .get('/api/ai/health')
      .expect(200);

    expect(res.body.status).toBe('active');
    expect(res.body.service).toBe('Shahin GRC Multi-Modal AI Assistant');
    expect(res.body.capabilities).toBeDefined();
    expect(Array.isArray(res.body.capabilities)).toBe(true);
  });
});

