import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uid: null,
  name: null,
  email: null,
  role: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => ({ ...initialState }),
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

