// src/store/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI } from '../../services/api';

// Async Thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getAll();
      return response.data.events;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventAPI.create(eventData);
      return response.data.event;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.update(id, data);
      return response.data.event;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await eventAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete event');
    }
  }
);

export const toggleSwappable = createAsyncThunk(
  'events/toggleSwappable',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventAPI.toggleSwappable(id);
      return response.data.event;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle status');
    }
  }
);

export const fetchEventStats = createAsyncThunk(
  'events/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
);

const initialState = {
  events: [],
  stats: {
    total: 0,
    busy: 0,
    swappable: 0,
    swapPending: 0,
  },
  loading: false,
  error: null,
  selectedEvent: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    selectEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEvents: (state) => {
      state.events = [];
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
        state.events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Toggle Swappable
      .addCase(toggleSwappable.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(toggleSwappable.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchEventStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { selectEvent, clearError, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;