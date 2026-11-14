import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usuario: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // apiSlice.js llama setAuth() sin payload tras un refresh exitoso (solo
    // confirma la sesión); el login llama setAuth(usuario) con los datos
    // que ya devuelve POST /api/auth/login.
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      if (action.payload) {
        state.usuario = action.payload;
      }
    },
    logout: (state) => {
      state.usuario = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
