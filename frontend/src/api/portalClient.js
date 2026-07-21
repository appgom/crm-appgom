// Cliente API separado del admin (frontend/src/api/client.js): golpea
// /api/portal/* en vez de /api/*, y dispara su propio evento de sesion
// vencida para no interferir con el AuthContext del CRM interno.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('portal:unauthorized'));
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const portalApi = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};
