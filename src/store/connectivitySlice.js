import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { syncService } from '../services/syncService';

const initialNetwork = typeof navigator === 'undefined' ? true : navigator.onLine;

/** Push pending bills. Skipped while offline or when a sync is already running. */
export const syncNow = createAsyncThunk(
  'connectivity/syncNow',
  () => syncService.syncPendingBills(),
  { condition: (_, { getState }) => selectIsOnline(getState()) && !getState().connectivity.syncing },
);

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState: {
    networkOnline: initialNetwork,
    // Lets a presenter demonstrate offline mode without unplugging (e.g. on a video call).
    simulatedOffline: false,
    syncing: false,
    lastError: null,
  },
  reducers: {
    setNetworkOnline(state, { payload }) { state.networkOnline = payload; },
    setSimulatedOffline(state, { payload }) { state.simulatedOffline = payload; },
  },
  extraReducers: (b) => {
    b.addCase(syncNow.pending, (s) => { s.syncing = true; s.lastError = null; })
      .addCase(syncNow.fulfilled, (s) => { s.syncing = false; })
      .addCase(syncNow.rejected, (s, a) => { s.syncing = false; s.lastError = a.error.message; });
  },
});

export const selectIsOnline = (s) => s.connectivity.networkOnline && !s.connectivity.simulatedOffline;

export const { setNetworkOnline, setSimulatedOffline } = connectivitySlice.actions;
export default connectivitySlice.reducer;
