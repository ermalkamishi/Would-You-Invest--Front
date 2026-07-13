import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
const storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};
import { combineReducers } from 'redux';
import authReducer from '../features/auth/authSlice';
import walletReducer from '../features/wallet/walletSlice';
import pitchesReducer from '../features/pitches/pitchesSlice';
import leaderboardReducer from '../features/leaderboard/leaderboardSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  pitches: pitchesReducer,
  leaderboard: leaderboardReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
