import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,       // { id, username, email, avatarUrl, badges }
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    showLoginModal: false,
    showWelcomeBonus: false,
    avatarLastChangedAt: null, // ISO timestamp — enforces 30-day cooldown
  },
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (action.payload.isNew && action.payload.user.role === 'investor') {
        state.showWelcomeBonus = true;
      }
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    addToPortfolio(state, action) {
      // action.payload = { id, problem, category, entryPrice, currentPrice, sharesBought, amountInvested }
      if (!state.user) return;
      if (!state.user.portfolio) state.user.portfolio = [];
      const existing = state.user.portfolio.find(h => h.id === action.payload.id);
      if (existing) {
        // Top-up existing holding
        existing.amountInvested += action.payload.amountInvested;
        existing.sharesBought += action.payload.sharesBought;
      } else {
        state.user.portfolio.push(action.payload);
      }
    },
    openLoginModal(state) {
      state.showLoginModal = true;
    },
    closeLoginModal(state) {
      state.showLoginModal = false;
    },
    closeWelcomeBonus(state) {
      state.showWelcomeBonus = false;
    },
    updateAvatar(state, action) {
      if (state.user) {
        state.user.avatarUrl = action.payload;
        state.avatarLastChangedAt = new Date().toISOString();
      }
    },
    updateProfileSuccess(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    claimStipendSuccess(state, action) {
      if (state.user) {
        state.user.walletBalance = action.payload.walletBalance;
        state.user.lastStipendClaimedAt = action.payload.lastStipendClaimedAt;
      }
    },
    setPortfolio(state, action) {
      if (state.user) {
        state.user.portfolio = action.payload;
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, openLoginModal, closeLoginModal, addToPortfolio, closeWelcomeBonus, updateAvatar, updateProfileSuccess, claimStipendSuccess, setPortfolio } = authSlice.actions;
export default authSlice.reducer;
