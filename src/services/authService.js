import { DEMO_USER } from '../config/app';

const KEY = 'sl_session';

// Mock authentication. The session shape (user + token) matches what the
// future JWT login endpoint will return.
export const authService = {
  async login(identifier, password) {
    await new Promise((r) => setTimeout(r, 450));
    const id = identifier.trim().toLowerCase();
    const matches = (id === DEMO_USER.email || id === 'owner') && password === DEMO_USER.password;
    if (!matches) throw new Error('Incorrect email or password.');

    const { password: _omit, ...user } = DEMO_USER;
    const session = { user, token: 'demo-token', issuedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(KEY);
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  },
};
