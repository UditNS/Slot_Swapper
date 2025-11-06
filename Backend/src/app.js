const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const app = express();

require('dotenv').config()

// CORS Configuration
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/swaps', require('./routes/swap'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SlotSwapper API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 CORS enabled for development mode`);
    });
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));