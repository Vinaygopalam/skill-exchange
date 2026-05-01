const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

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
    res.status(201).json({ message: 'Request sent successfully!', request });

  } catch (error) {
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

// @route   PUT /api/requests/:id
// @desc    Accept or reject request
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found!' });
    }

    request.status = req.body.status;
    await request.save();

    res.json({ message: `Request ${req.body.status}!`, request });

  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;