// backend/routes/swaps.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/events');
const SwapRequest = require('../models/swapRequest');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET - Get all swappable slots from OTHER users
router.get('/swappable-slots', async (req, res) => {
  try {
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: req.userId } // Exclude current user's slots
    }).populate('userId', 'name email').sort({ startTime: 1 });

    // Format response
    const formattedSlots = swappableSlots.map(slot => ({
      id: slot._id,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      owner: {
        id: slot.userId._id,
        name: slot.userId.name
      }
    }));

    res.json(formattedSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create a swap request
router.post('/swap-request', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ error: 'Both mySlotId and theirSlotId are required' });
    }

    // Fetch both slots
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);

    // Validation checks
    if (!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'One or both slots not found' });
    }

    if (mySlot.userId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'You do not own mySlot' });
    }

    if (theirSlot.userId.toString() === req.userId) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Cannot swap with your own slot' });
    }

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Both slots must be SWAPPABLE' });
    }

    // Check if a swap request already exists for these slots
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { mySlotId, theirSlotId, status: 'PENDING' },
        { mySlotId: theirSlotId, theirSlotId: mySlotId, status: 'PENDING' }
      ]
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'A swap request already exists for these slots' });
    }

    // Create swap request
    const swapRequest = new SwapRequest({
      requesterId: req.userId,
      recipientId: theirSlot.userId,
      mySlotId,
      theirSlotId,
      status: 'PENDING'
    });

    await swapRequest.save({ session });

    // Update both slots to SWAP_PENDING
    mySlot.status = 'SWAP_PENDING';
    theirSlot.status = 'SWAP_PENDING';

    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();

    // Populate and return the swap request
    await swapRequest.populate([
      { path: 'requesterId', select: 'name email' },
      { path: 'recipientId', select: 'name email' },
      { path: 'mySlotId' },
      { path: 'theirSlotId' }
    ]);

    res.status(201).json(swapRequest);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// POST - Respond to a swap request (Accept or Reject)
router.post('/swap-response/:requestId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { accepted } = req.body;

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({ error: 'accepted field must be a boolean' });
    }

    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate('mySlotId')
      .populate('theirSlotId')
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify the user is the recipient
    if (swapRequest.recipientId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'You are not authorized to respond to this request' });
    }

    // Check if request is still pending
    if (swapRequest.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'This swap request has already been processed' });
    }

    const mySlot = swapRequest.mySlotId;
    const theirSlot = swapRequest.theirSlotId;

    if (accepted) {
      // ACCEPT: Swap the owners
      const tempUserId = mySlot.userId;
      mySlot.userId = theirSlot.userId;
      theirSlot.userId = tempUserId;

      // Set both slots back to BUSY
      mySlot.status = 'BUSY';
      theirSlot.status = 'BUSY';

      await mySlot.save({ session });
      await theirSlot.save({ session });

      swapRequest.status = 'ACCEPTED';
      await swapRequest.save({ session });

      await session.commitTransaction();

      res.json({
        message: 'Swap accepted successfully',
        swapRequest,
        updatedSlots: [mySlot, theirSlot]
      });
    } else {
      // REJECT: Set both slots back to SWAPPABLE
      mySlot.status = 'SWAPPABLE';
      theirSlot.status = 'SWAPPABLE';

      await mySlot.save({ session });
      await theirSlot.save({ session });

      swapRequest.status = 'REJECTED';
      await swapRequest.save({ session });

      await session.commitTransaction();

      res.json({
        message: 'Swap rejected',
        swapRequest
      });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

// GET - Get all swap requests (incoming and outgoing)
router.get('/my-requests', async (req, res) => {
  try {
    // Incoming requests (where I'm the recipient)
    const incoming = await SwapRequest.find({
      recipientId: req.userId
    })
      .populate('requesterId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId')
      .sort({ createdAt: -1 });

    // Outgoing requests (where I'm the requester)
    const outgoing = await SwapRequest.find({
      requesterId: req.userId
    })
      .populate('recipientId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get a specific swap request
router.get('/request/:requestId', async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.requestId)
      .populate('requesterId', 'name email')
      .populate('recipientId', 'name email')
      .populate('mySlotId')
      .populate('theirSlotId');

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify user is part of the swap
    if (
      swapRequest.requesterId._id.toString() !== req.userId &&
      swapRequest.recipientId._id.toString() !== req.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(swapRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Get swap statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;

    const total = await SwapRequest.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
    });

    const pending = await SwapRequest.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'PENDING',
    });

    const accepted = await SwapRequest.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'ACCEPTED',
    });

    const rejected = await SwapRequest.countDocuments({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'REJECTED',
    });

    res.json({
      total,
      pending,
      accepted,
      rejected,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Cancel swap request (NEW)
router.delete('/cancel/:requestId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;

    const swapRequest = await SwapRequest.findById(requestId)
      .populate('mySlotId')
      .populate('theirSlotId')
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Verify the user is the requester
    if (swapRequest.requesterId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Set both slots back to SWAPPABLE
    const mySlot = await Event.findById(swapRequest.mySlotId).session(session);
    const theirSlot = await Event.findById(swapRequest.theirSlotId).session(session);

    if (mySlot) {
      mySlot.status = 'SWAPPABLE';
      await mySlot.save({ session });
    }

    if (theirSlot) {
      theirSlot.status = 'SWAPPABLE';
      await theirSlot.save({ session });
    }

    // Delete the swap request
    await swapRequest.deleteOne({ session });

    await session.commitTransaction();

    res.json({ message: 'Swap request cancelled successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;