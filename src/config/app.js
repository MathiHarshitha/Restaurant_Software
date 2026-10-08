// Central application configuration. When a real backend is connected,
// set VITE_API_URL and the API client switches from the mock server to HTTP.
export const APP_CONFIG = {
  restaurantId: 'rst_connect_dhaba_001',
  apiBaseUrl: import.meta.env.VITE_API_URL || '',
  currency: 'INR',
  locale: 'en-IN',
  billPrefix: 'BILL-',
  firstBillSeq: 1001,
  defaultGstRate: 5,
  dbName: 'restaurant_billing',
  // Bump when the demo dataset changes shape so existing installs reseed.
  seedVersion: 4,
};

export const DEMO_USER = {
  id: 'usr_owner_001',
  email: 'owner@connect.in',
  password: 'connect@123',
  name: 'John Doe',
  role: 'Owner',
};

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi',  label: 'UPI' },
  { id: 'card', label: 'Card' },
];

export const PAYMENT_LABELS = { cash: 'Cash', upi: 'UPI', card: 'Card' };
