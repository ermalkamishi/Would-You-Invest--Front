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
      const existingPortfolio = state.user?.portfolio || [];
      state.user = {
        ...action.payload.user,
        portfolio: action.payload.user?.portfolio || existingPortfolio,
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (action.payload.isNew && action.payload.user?.role === 'investor') {
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
    divestFromPortfolio(state, action) {
      // action.payload = { id, sharesSold, returnAmount }
      if (!state.user || !state.user.portfolio) return;
      const existing = state.user.portfolio.find(h => h.id === action.payload.id);
      if (existing) {
        const totalShares = Number(existing.sharesBought || 0);
        const sharesSold = Number(action.payload.sharesSold || 0);
        if (sharesSold >= totalShares - 0.001) {
          // Liquidated entirely
          state.user.portfolio = state.user.portfolio.filter(h => h.id !== action.payload.id);
        } else {
          const fraction = totalShares > 0 ? (sharesSold / totalShares) : 1;
          existing.sharesBought = parseFloat((totalShares - sharesSold).toFixed(4));
          existing.amountInvested = parseFloat(Math.max(0, existing.amountInvested * (1 - fraction)).toFixed(2));
        }
      }
      if (action.payload.returnAmount && state.user.walletBalance !== undefined) {
        state.user.walletBalance = parseFloat((Number(state.user.walletBalance) + Number(action.payload.returnAmount)).toFixed(2));
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
        const existingPortfolio = state.user.portfolio || [];
        state.user = {
          ...state.user,
          ...action.payload,
          portfolio: action.payload.portfolio || existingPortfolio,
        };
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
        state.user.portfolio = action.payload || [];
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, openLoginModal, closeLoginModal, addToPortfolio, divestFromPortfolio, closeWelcomeBonus, updateAvatar, updateProfileSuccess, claimStipendSuccess, setPortfolio } = authSlice.actions;
export default authSlice.reducer;
