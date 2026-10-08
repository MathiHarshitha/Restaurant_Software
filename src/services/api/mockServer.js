// Stand-in for the future Express API while the demo runs without a backend.
// Behaves like a real endpoint: it has latency and it fails without a network.

const LATENCY_MS = 1100;

export class NetworkError extends Error {
  constructor(message = 'No internet connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockServer = {
  async post(path, body) {
    await wait(LATENCY_MS);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new NetworkError();

    if (path === '/bills/sync') {
      return { accepted: body.bills.map((b) => b.id), serverTime: new Date().toISOString() };
    }
    throw new Error(`Mock route not implemented: ${path}`);
  },
};
