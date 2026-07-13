import { createSlice } from '@reduxjs/toolkit';

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    activeTab: 'hot',  // 'hot' | 'funded' | 'roi' | 'rising' | 'category'
    entries: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setEntries(state, action) {
      state.entries = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setActiveTab, setEntries, setLoading, setError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
