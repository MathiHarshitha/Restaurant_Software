import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

export const login = createAsyncThunk('auth/login', ({ identifier, password }) => authService.login(identifier, password));

const session = authService.getSession();

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: session?.user ?? null, status: 'idle', error: null },
  reducers: {
    logout(state) {
      authService.logout();
      state.user = null;
      state.status = 'idle';
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.status = 'idle'; s.user = a.payload.user; })
      .addCase(login.rejected, (s, a) => { s.status = 'idle'; s.error = a.error.message; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
