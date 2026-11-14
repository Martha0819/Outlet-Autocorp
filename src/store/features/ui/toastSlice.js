import { createSlice, nanoid } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toasts',
  initialState: { items: [] },
  reducers: {
    addToast: {
      prepare: (message, type = 'success') => ({ payload: { id: nanoid(), message, type } }),
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
    },
    removeToast: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
