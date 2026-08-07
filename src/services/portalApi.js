const API_ROOT = '/api/portal';

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Portal adapter returned ${response.status}`);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

export const portalApi = {
  health: () => request('/health'),
  services: () => request('/services'),
  applications: () => request('/applications'),
  createApplication: (payload) => request('/applications', { method: 'POST', body: JSON.stringify(payload) }),
  requestComplaintVerification: (phone) => request('/complaints/verification', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyComplaintPhone: (verificationId, code) => request('/complaints/verification/confirm', {
    method: 'POST',
    body: JSON.stringify({ verificationId, code }),
  }),
  submitComplaint: (payload) => request('/complaints', { method: 'POST', body: JSON.stringify(payload) }),
};

export const officialPortalLinks = {
  login: 'https://portal.btea.bh/Login/doSignIn_Ekey',
  ekey2: 'https://portal.btea.bh/Login/LoginWithEkey',
  inspection: 'https://portal.btea.bh/HCSys',
  complaints: 'https://portal.btea.bh/Complaint',
  faq: 'https://portal.btea.bh/MainP/FAQs',
  regulations: 'https://portal.btea.bh/MainP/LawsAndRegulations',
  circulars: 'https://portal.btea.bh/MainP/Circulars',
  accessibility: 'https://portal.btea.bh/MainP/Accessibility',
  contact: 'https://portal.btea.bh/MainP/ContactUs',
};

