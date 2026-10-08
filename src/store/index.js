import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import cart from './cartSlice';
import connectivity from './connectivitySlice';

// Global state is limited to what several screens share: session, the open order
// and connectivity. Persistent data (menu, bills) is read from IndexedDB via services.
export const store = configureStore({
  reducer: { auth, cart, connectivity },
});
