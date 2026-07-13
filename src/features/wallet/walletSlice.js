import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,              // Starts at 0
    dailyStipendClaimed: false,
    stipendAmount: 1000,     // +$1,000/day login bonus
    totalInvested: 0,
  },
  reducers: {
    deductFromWallet(state, action) {
      state.balance -= action.payload;
      state.totalInvested += action.payload;
    },
    claimDailyStipend(state) {
      if (!state.dailyStipendClaimed) {
        state.balance += state.stipendAmount;
        state.dailyStipendClaimed = true;
      }
    },
    setBalance(state, action) {
      state.balance = action.payload;
    },
  },
});

export const { deductFromWallet, claimDailyStipend, setBalance } = walletSlice.actions;
export default walletSlice.reducer;
