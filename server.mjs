import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { officialServices } from './src/data/officialServices.js';

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultDistRoot = path.join(moduleDirectory, 'dist');
const bodyLimit = 1024 * 1024;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
};

const readJson = (request) => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > bodyLimit) reject(Object.assign(new Error('Request body is too large'), { statusCode: 413 }));
  });
  request.on('end', () => {
    if (!body) return resolve({});
    try {
      resolve(JSON.parse(body));
    } catch {
      reject(Object.assign(new Error('Request body must be valid JSON'), { statusCode: 400 }));
    }
  });
  request.on('error', reject);
});

const normalizePhone = (value) => String(value || '').replace(/[^0-9]/g, '');
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

export const createPortalState = () => ({
  applications: [],
  inspections: [],
  payments: [],
  complaints: [],
  verifications: new Map(),
});

export const resolveStaticPath = (distRoot, requestPath) => {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(distRoot, relative);
  const rootWithSeparator = `${path.resolve(distRoot)}${path.sep}`;
  if (candidate !== path.resolve(distRoot) && !candidate.startsWith(rootWithSeparator)) return null;
  return candidate;
};

const serveStatic = async (response, distRoot, pathname) => {
  const candidate = resolveStaticPath(distRoot, pathname);
  if (!candidate) return json(response, 400, { error: 'Invalid asset path' });
  try {
    const info = await stat(candidate);
    const filePath = info.isDirectory() ? path.join(candidate, 'index.html') : candidate;
    const content = await readFile(filePath);
    response.writeHead(200, {
      ...securityHeaders,
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=3600',
    });
    response.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') return json(response, 404, { error: 'Not found' });
    return json(response, 500, { error: 'Unable to read the requested asset' });
  }
};

const serviceExists = (serviceId) => officialServices.some((service) => service.id === String(serviceId));

export const createPortalServer = ({
  distRoot = defaultDistRoot,
  state = createPortalState(),
  verificationCode = '2468',
  exposeDemoCode = true,
} = {}) => createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const { pathname } = url;

  if (request.method === 'GET' && pathname === '/api/portal/health') {
    return json(response, 200, {
      status: 'ready',
      mode: 'local-simulation',
      externalWrites: false,
      serviceCount: officialServices.length,
      message: 'Local adapter ready. Protected BTEA endpoints are not called.',
    });
  }

  if (request.method === 'GET' && pathname === '/api/portal/services') {
    return json(response, 200, { services: officialServices, source: 'publicly observed BTEA service directory' });
  }

  if (request.method === 'GET' && pathname === '/api/portal/applications') {
    return json(response, 200, { applications: state.applications });
  }

  if (request.method === 'POST' && pathname === '/api/portal/applications') {
    try {
      const payload = await readJson(request);
      if (!serviceExists(payload.serviceId)) return json(response, 422, { error: 'A valid serviceId is required' });
      const service = officialServices.find((item) => item.id === String(payload.serviceId));
      const application = {
        id: `BTEA-LOCAL-${randomUUID().slice(0, 8).toUpperCase()}`,
        serviceId: service.id,
        propertyId: payload.propertyId || null,
        title: payload.title || service.title,
        status: 'Draft',
        stage: 1,
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.applications.unshift(application);
      return json(response, 201, { application, externalWrite: false });
    } catch (error) {
      return json(response, error.statusCode || 400, { error: error.message });
    }
  }

  if (request.method === 'GET' && pathname === '/api/portal/inspections') {
    return json(response, 200, { inspections: state.inspections });
  }

  if (request.method === 'GET' && pathname === '/api/portal/payments') {
    return json(response, 200, { payments: state.payments, externalPayments: false });
  }

  if (request.method === 'POST' && pathname === '/api/portal/complaints/verification') {
    try {
      const payload = await readJson(request);
      const phone = normalizePhone(payload.phone);
      if (phone.length < 8 || phone.length > 15) return json(response, 422, { error: 'Enter a valid phone number' });
      const verificationId = randomUUID();
      state.verifications.set(verificationId, {
        phoneLast4: phone.slice(-4),
        code: verificationCode,
        verified: false,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return json(response, 201, {
        verificationId,
        expiresInSeconds: 300,
        delivery: 'local-demo',
        ...(exposeDemoCode ? { demoCode: verificationCode } : {}),
      });
    } catch (error) {
      return json(response, error.statusCode || 400, { error: error.message });
    }
  }

  if (request.method === 'POST' && pathname === '/api/portal/complaints/verification/confirm') {
    try {
      const payload = await readJson(request);
      const verification = state.verifications.get(payload.verificationId);
      if (!verification || verification.expiresAt < Date.now()) return json(response, 410, { error: 'Verification expired' });
      if (String(payload.code) !== verification.code) return json(response, 422, { error: 'Verification code is incorrect' });
      verification.verified = true;
      return json(response, 200, { verified: true });
    } catch (error) {
      return json(response, error.statusCode || 400, { error: error.message });
    }
  }

  if (request.method === 'POST' && pathname === '/api/portal/complaints') {
    try {
      const payload = await readJson(request);
      const verification = state.verifications.get(payload.verificationId);
      if (!verification?.verified) return json(response, 422, { error: 'Phone verification is required' });
      if (!String(payload.name || '').trim() || !validEmail(payload.email) || !String(payload.subject || '').trim() || !String(payload.message || '').trim()) {
        return json(response, 422, { error: 'Name, valid email, subject, and message are required' });
      }
      const complaint = {
        id: `CMP-${randomUUID().slice(0, 8).toUpperCase()}`,
        name: String(payload.name).trim(),
        email: String(payload.email).trim(),
        phoneLast4: verification.phoneLast4,
        subject: String(payload.subject).trim(),
        message: String(payload.message).trim(),
        directorate: String(payload.directorate || '').trim(),
        date: payload.date || null,
        attachments: Array.isArray(payload.attachments) ? payload.attachments.map((item) => String(item).slice(0, 160)).slice(0, 10) : [],
        status: 'Received locally',
        createdAt: new Date().toISOString(),
      };
      state.complaints.unshift(complaint);
      return json(response, 201, { complaint, externalWrite: false });
    } catch (error) {
      return json(response, error.statusCode || 400, { error: error.message });
    }
  }

  if (pathname.startsWith('/api/portal/')) return json(response, 404, { error: 'API route not found' });
  return serveStatic(response, distRoot, pathname);
});

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const portArgument = process.argv.indexOf('--port');
  const requestedPort = portArgument >= 0 ? process.argv[portArgument + 1] : null;
  const port = Number(requestedPort || process.env.PORT || 4173);
  const host = process.env.HOST || '127.0.0.1';
  createPortalServer({ exposeDemoCode: process.env.NODE_ENV !== 'production' }).listen(port, host, () => {
    console.log(`BTEA preserved portal running at http://${host}:${port}`);
  });
}
