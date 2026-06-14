const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const User = require('../models/user');
const { createNotification } = require('../middleware/notificationHelper');

// Get unread message counts for the logged in user
router.get('/unread', auth, async (req, res) => {
  try {
    const counts = await Message.aggregate([
      { $match: { senderId: { $ne: req.user.id }, status: { $ne: 'read' } } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } }
    ]);
    const unreadCounts = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    res.json(unreadCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Mark unread messages in a room as read for the logged in user
router.put('/read/:roomId', auth, async (req, res) => {
  try {
    let finalRoomId = req.params.roomId;
    const isRequestId = req.params.roomId.match(/^[a-f\d]{24}$/i);
    
    if (isRequestId) {
      const Request = require('../models/Request');
      const request = await Request.findById(req.params.roomId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found!' });
      }
      
      const fromId = request.fromUser.toString();
      const toId = request.toUser.toString();
      finalRoomId = [fromId, toId].sort().join('_');
    }
    
    const messages = await Message.find({
      roomId: finalRoomId,
      senderId: { $ne: req.user.id },
      status: { $ne: 'read' }
    });

    const updatedIds = messages.map((message) => message._id.toString());

    await Message.updateMany({
      roomId: finalRoomId,
      senderId: { $ne: req.user.id },
      status: { $ne: 'read' }
    }, {
      status: 'read',
      readAt: new Date()
    });

    res.json({ updatedCount: updatedIds.length, updatedIds });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Get all messages for a room
router.get('/:roomId', auth, async (req, res) => {
  try {
    let finalRoomId = req.params.roomId;
    const isRequestId = req.params.roomId.match(/^[a-f\d]{24}$/i);
    
    if (isRequestId) {
      const Request = require('../models/Request');
      const request = await Request.findById(req.params.roomId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found!' });
      }
      
      const fromId = request.fromUser.toString();
      const toId = request.toUser.toString();
      finalRoomId = [fromId, toId].sort().join('_');
    }
    
    const messages = await Message.find({ roomId: finalRoomId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Save a message
router.post('/', auth, async (req, res) => {
  try {
    const { roomId, message, attachments = [] } = req.body;
    const senderId = req.user.id;

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ message: 'roomId is required!' });
    }

    // Check if roomId is a Request ID (MongoDB ObjectId format) or userId format
    const isRequestId = roomId.match(/^[a-f\d]{24}$/i);
    let finalRoomId = roomId;
    let receiverId = null;

    if (isRequestId) {
      // It's a request ID - get the participants
      const Request = require('../models/Request');
      const request = await Request.findById(roomId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found!' });
      }
      
      const fromId = request.fromUser.toString();
      const toId = request.toUser.toString();
      
      // Ensure user is part of this request
      if (fromId !== senderId && toId !== senderId) {
        return res.status(403).json({ message: 'Not authorized to send messages in this room!' });
      }
      
      receiverId = fromId === senderId ? toId : fromId;
      finalRoomId = [fromId, toId].sort().join('_');
    } else {
      // roomId format should be: userId1_userId2 (based on frontend route /chat/:roomId)
      const roomParts = roomId.split('_').filter(Boolean);
      if (roomParts.length < 2) {
        return res.status(400).json({
          message: 'Invalid roomId format! Expected userId1_userId2 or requestId',
          roomId
        });
      }

      // Ensure authenticated user is part of the room (prevents spoofing)
      if (!roomParts.includes(senderId)) {
        return res.status(403).json({ message: 'Not authorized to send messages in this room!' });
      }

      // Receiver is any other user id inside the roomId
      receiverId = roomParts.find((id) => id !== senderId);
    }

    const normalizedMessage = (message || '').trim() || (attachments.length ? `Sent ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}` : '');

    if (!normalizedMessage) {
      return res.status(400).json({ message: 'Message content is required!' });
    }

    // Use server-side sender name (no client spoofing)
    const senderUser = await User.findById(senderId).select('name');
    const senderName = senderUser?.name || 'User';

    const newMessage = new Message({
      roomId: finalRoomId,
      message: normalizedMessage,
      sender: senderName,
      senderId,
      attachments
    });
    await newMessage.save();

    // Create notification for the receiver
    if (receiverId) {
      const notificationPreview = normalizedMessage.length > 50 ? normalizedMessage.substring(0, 50) + '...' : normalizedMessage;
      await createNotification({
        userId: receiverId,
        type: 'message',
        title: `New message from ${senderName}`,
        message: notificationPreview,
        relatedId: newMessage._id,
        relatedType: 'Message',
        actionUrl: `/chat/${roomId}`,
        sendEmail: true
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// ✅ Delete a message (only sender can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    // Check if message exists
    if (!message) {
      return res.status(404).json({ message: 'Message not found!' });
    }

    // Check if the logged-in user is the sender
    if (message.senderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message!' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;