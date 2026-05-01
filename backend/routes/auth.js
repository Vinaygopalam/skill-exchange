const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      location
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
});
// @route   GET /api/auth/profile/:id
// @desc    Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found!' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', async (req, res) => {
  try {
    const auth = require('../middleware/auth');
    const { name, location, bio, skillsOffered, skillsNeeded } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, location, bio, skillsOffered, skillsNeeded },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});
// @route   POST /api/auth/rate/:id
// @desc    Rate a user
router.post('/rate/:id', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rating, comment } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found!' });
    user.reviews.push({
      fromUser: decoded.id,
      rating,
      comment
    });
    user.totalRatings += 1;
    user.rating = user.reviews.reduce((acc, r) => acc + r.rating, 0) / user.reviews.length;
    await user.save();
    res.json({ message: 'Rating submitted successfully! ⭐', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;