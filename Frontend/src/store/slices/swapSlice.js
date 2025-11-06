import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { swapAPI } from '../../services/api';

// Async Thunks
export const fetchSwappableSlots = createAsyncThunk(
  'swaps/fetchSwappableSlots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await swapAPI.getSwappableSlots();
      // Backend returns array directly, not wrapped in 'slots'
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch slots');
    }
  }
);

export const createSwapRequest = createAsyncThunk(
  'swaps/createSwapRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await swapAPI.createSwapRequest(requestData);
      // Backend returns swap request directly
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create swap request');
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'swaps/fetchMyRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await swapAPI.getMyRequests();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch requests');
    }
  }
);

export const respondToSwap = createAsyncThunk(
  'swaps/respondToSwap',
  async ({ requestId, accepted }, { rejectWithValue }) => {
    try {
      const response = await swapAPI.respondToSwap(requestId, accepted);
      return { requestId, accepted, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to respond to swap');
    }
  }
);

export const cancelSwapRequest = createAsyncThunk(
  'swaps/cancelSwapRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await swapAPI.cancelSwapRequest(requestId);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel request');
    }
  }
);

export const fetchSwapStats = createAsyncThunk(
  'swaps/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await swapAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch stats');
    }
  }
);

const initialState = {
  swappableSlots: [],
  incomingRequests: [],
  outgoingRequests: [],
  stats: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  },
  loading: false,
  error: null,
  actionLoading: false,
};

const swapsSlice = createSlice({
  name: 'swaps',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSwaps: (state) => {
      state.swappableSlots = [];
      state.incomingRequests = [];
      state.outgoingRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Swappable Slots
      .addCase(fetchSwappableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSwappableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.swappableSlots = action.payload;
      })
      .addCase(fetchSwappableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Swap Request
      .addCase(createSwapRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createSwapRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.outgoingRequests.push(action.payload);
      })
      .addCase(createSwapRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Fetch My Requests
      .addCase(fetchMyRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.loading = false;
        // Fixed: Handle data structure correctly
        state.incomingRequests = action.payload.incoming || [];
        state.outgoingRequests = action.payload.outgoing || [];
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Respond to Swap
      .addCase(respondToSwap.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(respondToSwap.fulfilled, (state, action) => {
        state.actionLoading = false;
        const { requestId, accepted } = action.payload;
        const index = state.incomingRequests.findIndex(r => r._id === requestId);
        if (index !== -1) {
          state.incomingRequests[index].status = accepted ? 'ACCEPTED' : 'REJECTED';
        }
      })
      .addCase(respondToSwap.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Cancel Swap Request
      .addCase(cancelSwapRequest.fulfilled, (state, action) => {
        state.outgoingRequests = state.outgoingRequests.filter(
          r => r._id !== action.payload
        );
      })
      .addCase(cancelSwapRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchSwapStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearSwaps } = swapsSlice.actions;
export default swapsSlice.reducer;