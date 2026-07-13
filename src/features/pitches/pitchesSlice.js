import { createSlice } from '@reduxjs/toolkit';

const pitchesSlice = createSlice({
  name: 'pitches',
  initialState: {
    feed: [],              // Array of pitch objects from the API
    activeFeedIndex: 0,    // The currently visible pitch in the scroller
    highlightPitchId: null, // Set when a live alert is clicked to scroll to that pitch
    isLoading: false,
    error: null,
  },
  reducers: {
    setPitches(state, action) {
      state.feed = action.payload;
    },
    nextPitch(state) {
      if (state.activeFeedIndex < state.feed.length - 1) {
        state.activeFeedIndex += 1;
      }
    },
    prevPitch(state) {
      if (state.activeFeedIndex > 0) {
        state.activeFeedIndex -= 1;
      }
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    addComment(state, action) {
      // payload: { pitchId, comment: { id, author, text, timestamp } }
      const { pitchId, comment } = action.payload;
      const pitch = state.feed.find((p) => p.id === pitchId);
      if (pitch) {
        if (!pitch.comments) pitch.comments = [];
        pitch.comments.push(comment);
      }
    },
    upvoteComment(state, action) {
      // payload: { pitchId, commentId, userId }
      const { pitchId, commentId, userId } = action.payload;
      const pitch = state.feed.find((p) => p.id === pitchId);
      if (pitch) {
        const comment = pitch.comments?.find((c) => c.id === commentId);
        if (comment) {
          if (!comment.upvotedBy) comment.upvotedBy = [];
          const alreadyLiked = comment.upvotedBy.includes(userId);
          if (alreadyLiked) {
            comment.upvotedBy = comment.upvotedBy.filter((id) => id !== userId);
          } else {
            comment.upvotedBy.push(userId);
          }
        }
      }
    },
    patchPitchStats(state, action) {
      const idx = state.feed.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.feed[idx] = { ...state.feed[idx], ...action.payload };
    },
    setHighlightPitchId(state, action) {
      state.highlightPitchId = action.payload; // pitch ID to scroll to
    },
    clearHighlightPitchId(state) {
      state.highlightPitchId = null;
    },
  },
});

export const { setPitches, nextPitch, prevPitch, setLoading, setError, addComment, upvoteComment, patchPitchStats, setHighlightPitchId, clearHighlightPitchId } = pitchesSlice.actions;
export default pitchesSlice.reducer;
