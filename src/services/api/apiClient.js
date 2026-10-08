import { APP_CONFIG } from '../../config/app';
import { authService } from '../authService';
import { mockServer, NetworkError } from './mockServer';

/**
 * Thin HTTP client. With VITE_API_URL set it talks to the real backend
 * (Express + JWT); otherwise it routes to the in-browser mock server.
 */
async function post(path, body) {
  if (!APP_CONFIG.apiBaseUrl) return mockServer.post(path, body);

  let res;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authService.getSession()?.token ?? ''}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const apiClient = { post };
export { NetworkError };
