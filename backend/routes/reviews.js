const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const User = require('../models/user');
const { createNotification } = require('../middleware/notificationHelper');

// @route   POST /api/reviews
// @desc    Submit a review for a completed exchange
router.post('/', auth, async (req, res) => {
  try {
    const { toUser, requestId, rating, comment } = req.body;

    // Check if request exists and is completed
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found!' });
    }
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Exchange must be completed to leave a review!' });
    }

    // Check if user is part of the exchange
    if (request.fromUser.toString() !== req.user.id && request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized!' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ fromUser: req.user.id, request: requestId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already submitted!' });
    }

    const review = new Review({
      fromUser: req.user.id,
      toUser,
      request: requestId,
      rating,
      comment
    });

    await review.save();

    // Update reviewed user's profile summary and persist reviews
    const reviewedUser = await User.findById(toUser);
    if (reviewedUser) {
      reviewedUser.reviews.push({
        fromUser: req.user.id,
        rating,
        comment
      });
      reviewedUser.totalRatings = (reviewedUser.totalRatings || 0) + 1;
      reviewedUser.rating = reviewedUser.reviews.length
        ? reviewedUser.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewedUser.reviews.length
        : 0;
      await reviewedUser.save();
    }

    // Create notification for the reviewed user
    const reviewer = await User.findById(req.user.id);

    await createNotification({
      userId: toUser,
      type: 'review',
      title: `${reviewer.name} left you a ${rating}⭐ review`,
      message: comment || 'Great exchange!',
      relatedId: review._id,
      relatedType: 'Review',
      actionUrl: '/profile'
    });

    res.status(201).json({ message: 'Review submitted!', review });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/reviews/rating/:userId
// @desc    Get average rating for a user
router.get('/rating/:userId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ toUser: req.params.userId });
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    res.json({ avgRating: parseFloat(avgRating), totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/reviews/:userId
// @desc    Get reviews for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ toUser: req.params.userId })
      .populate('fromUser', 'name')
      .populate('request')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;