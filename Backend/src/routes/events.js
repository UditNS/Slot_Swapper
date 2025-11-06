const express = require('express');
const router = express.Router();
const Event = require('../models/events');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET - Get all events for the logged-in user
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.userId }).sort({ startTime: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, startTime, and endTime are required' });
    }

    // Create event
    const event = new Event({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      userId: req.userId,
      status: 'BUSY'
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update an event
router.put('/:id', async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prevent updates if event is in SWAP_PENDING status
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot update event with pending swap' });
    }

    // Update fields
    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (status && ['BUSY', 'SWAPPABLE'].includes(status)) {
      event.status = status;
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prevent deletion if event is in SWAP_PENDING status
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot delete event with pending swap' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Toggle swappable status
router.patch('/:id/toggle-swappable', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ error: 'Cannot modify event with pending swap' });
    }

    // Toggle between BUSY and SWAPPABLE
    event.status = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    await event.save();
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET - Get event statistics
router.get('/stats/upcoming', async (req, res) => {
  try {
    const userId = req.userId;

    const total = await Event.countDocuments({ userId });
    const busy = await Event.countDocuments({ userId, status: 'BUSY' });
    const swappable = await Event.countDocuments({ userId, status: 'SWAPPABLE' });
    const swapPending = await Event.countDocuments({ userId, status: 'SWAP_PENDING' });

    res.json({
      total,
      busy,
      swappable,
      swapPending,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;