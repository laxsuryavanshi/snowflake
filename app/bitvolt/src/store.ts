import { configureStore } from '@reduxjs/toolkit';

import { fsReducer } from './features/fs';

const store = configureStore({
  reducer: {
    fs: fsReducer,
  },
});

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
