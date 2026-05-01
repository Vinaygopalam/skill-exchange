const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get all messages for a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Save a message
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, message, sender, senderId } = req.body;
    const newMessage = new Message({
      roomId,
      message,
      sender,
      senderId
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;