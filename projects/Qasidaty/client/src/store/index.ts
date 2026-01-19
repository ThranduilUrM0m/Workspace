import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  ready: boolean;
}

const initialState: AppState = { ready: true };

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload;
    }
  }
});

export const { setReady } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
