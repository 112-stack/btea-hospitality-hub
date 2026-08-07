import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPortalServer, resolveStaticPath } from './server.mjs';

let server;
let baseUrl;

beforeEach(async () => {
  server = createPortalServer({ verificationCode: '2468', exposeDemoCode: true });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('preserved portal API', () => {
  it('publishes the complete observed service directory', async () => {
    const response = await fetch(`${baseUrl}/api/portal/services`);
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.services).toHaveLength(19);
    expect(payload.services.some((service) => service.id === 'complaints')).toBe(true);
  });

  it('creates only local applications for known services', async () => {
    const response = await fetch(`${baseUrl}/api/portal/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: '2', title: 'Q3 levy' }),
    });
    const payload = await response.json();
    expect(response.status).toBe(201);
    expect(payload.application.status).toBe('Draft');
    expect(payload.externalWrite).toBe(false);
  });

  it('uses POST verification and rejects unverified complaints', async () => {
    const verificationResponse = await fetch(`${baseUrl}/api/portal/complaints/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+973 3900 0000' }),
    });
    const verification = await verificationResponse.json();
    expect(verification.demoCode).toBe('2468');

    const rejected = await fetch(`${baseUrl}/api/portal/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId: verification.verificationId, name: 'Demo', email: 'demo@example.com', subject: 'Test', message: 'Test' }),
    });
    expect(rejected.status).toBe(422);
  });

  it('keeps static paths inside the build directory', () => {
    const root = 'C:\\safe\\dist';
    expect(resolveStaticPath(root, '/portal.html')).toBe('C:\\safe\\dist\\portal.html');
    expect(resolveStaticPath(root, '/../secret.txt')).toBeNull();
    expect(resolveStaticPath(root, '/%2e%2e/secret.txt')).toBeNull();
  });
});

