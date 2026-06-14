const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Skill = require('../models/Skill');
const { createNotification } = require('../middleware/notificationHelper');

// @route   POST /api/requests
// @desc    Send exchange request
router.post('/', auth, async (req, res) => {
  try {
    const { toUser, skill, message } = req.body;

    // Check if request already exists
    const existing = await Request.findOne({
      fromUser: req.user.id,
      skill: skill
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already sent!' });
    }

    const request = new Request({
      fromUser: req.user.id,
      toUser,
      skill,
      message
    });

    await request.save();

    // Create notification for the receiver
    const fromUser = await User.findById(req.user.id);
    const skillData = await Skill.findById(skill);

    await createNotification({
      userId: toUser,
      type: 'request',
      title: `New Skill Exchange Request from ${fromUser.name}`,
      message: `${fromUser.name} wants to exchange: ${skillData?.title || 'a skill'}`,
      relatedId: request._id,
      relatedType: 'Request',
      actionUrl: '/requests',
      sendEmail: true
    });

    res.status(201).json({ message: 'Request sent successfully!', request });

  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/requests
// @desc    Get all requests for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.user.id })
      .populate('fromUser', 'name location')
      .populate('skill', 'title category')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});
// @route   GET /api/requests/sent
// @desc    Get requests sent by logged in user
router.get('/sent', auth, async (req, res) => {
  try {
    const requests = await Request.find({ fromUser: req.user.id })
      .populate('toUser', 'name location')
      .populate('skill', 'title category')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get request details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('fromUser', 'name location')
      .populate('toUser', 'name location')
      .populate('skill', 'title category');

    if (!request) {
      return res.status(404).json({ message: 'Request not found!' });
    }

    const isParticipant = [request.toUser.toString(), request.fromUser.toString()].includes(req.user.id);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this request.' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update request status (accept, reject, complete)
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found!' });
    }

    const { status } = req.body;
    const validStatuses = ['accepted', 'rejected', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update!' });
    }

    if (['accepted', 'rejected'].includes(status) && request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the request recipient can accept or reject this request.' });
    }

    if (status === 'completed') {
      if (request.status !== 'accepted') {
        return res.status(400).json({ message: 'Only accepted requests can be completed.' });
      }
      const isParticipant = [request.toUser.toString(), request.fromUser.toString()].includes(req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: 'Only participants can complete this exchange.' });
      }
    }

    request.status = status;
    await request.save();

    const currentUser = await User.findById(req.user.id);
    let notificationPayload = {
      type: 'request_status',
      relatedId: request._id,
      relatedType: 'Request',
      actionUrl: '/requests',
      sendEmail: true
    };

    if (status === 'accepted') {
      notificationPayload = {
        ...notificationPayload,
        userId: request.fromUser,
        title: `Your request was accepted ✅`,
        message: `${currentUser.name} accepted your skill exchange request.`
      };
    } else if (status === 'rejected') {
      notificationPayload = {
        ...notificationPayload,
        userId: request.fromUser,
        title: `Your request was rejected ❌`,
        message: `${currentUser.name} rejected your skill exchange request.`
      };
    } else if (status === 'completed') {
      const otherUser = request.fromUser.toString() === req.user.id ? request.toUser : request.fromUser;
      notificationPayload = {
        ...notificationPayload,
        userId: otherUser,
        title: `Exchange completed ✅`,
        message: `${currentUser.name} marked this request as completed. Please leave a review when ready.`
      };
    }

    await createNotification(notificationPayload);

    res.json({ message: `Request ${status}!`, request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;