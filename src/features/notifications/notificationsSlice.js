import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification(state, action) {
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.items.unshift({
          ...action.payload,
          timestamp: action.payload.timestamp || new Date().toISOString(),
          isRead: false,
        });
        // Limit to 30 notifications in history
        if (state.items.length > 30) {
          state.items.pop();
        }
        state.unreadCount = state.items.filter((n) => !n.isRead).length;
      }
    },
    markAsRead(state, action) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
