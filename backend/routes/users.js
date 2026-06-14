const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Request = require('../models/Request');
const Badge = require('../models/Badge');
const auth = require('../middleware/auth');

// @route   GET /api/users/leaderboard
// @desc    Get top users by rating and exchanges
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email location rating totalRatings bio avatar')
      .sort({ rating: -1, totalRatings: -1 })
      .limit(50);

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const completedCount = await Request.countDocuments({
          $or: [{ fromUser: user._id }, { toUser: user._id }],
          status: 'completed'
        });
        return {
          ...user.toObject(),
          completedExchanges: completedCount
        };
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/users/stats/:id
// @desc    Get user statistics
router.get('/stats/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found!' });

    const sentRequests = await Request.countDocuments({ fromUser: req.params.id });
    const receivedRequests = await Request.countDocuments({ toUser: req.params.id });
    const completedExchanges = await Request.countDocuments({
      $or: [{ fromUser: req.params.id }, { toUser: req.params.id }],
      status: 'completed'
    });
    const acceptedRequests = await Request.countDocuments({
      $or: [{ fromUser: req.params.id }, { toUser: req.params.id }],
      status: 'accepted'
    });
    const rejectedRequests = await Request.countDocuments({
      $or: [{ fromUser: req.params.id }, { toUser: req.params.id }],
      status: 'rejected'
    });

    const userBadges = await Badge.find({ unlockedBy: req.params.id });

    res.json({
      name: user.name,
      rating: user.rating,
      totalRatings: user.totalRatings,
      sentRequests,
      receivedRequests,
      completedExchanges,
      acceptedRequests,
      rejectedRequests,
      successRate: sentRequests > 0
        ? ((completedExchanges + acceptedRequests) / sentRequests * 100).toFixed(1)
        : 0,
      badges: userBadges,
      skillsOffered: user.skillsOffered?.length || 0,
      skillsNeeded: user.skillsNeeded?.length || 0,
      joinedDate: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/users/recommendations
// @desc    Get skill exchange recommendations based on complementary skills
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const currentNeededSkills = currentUser.skillsNeeded || [];

    // Find users whose offered skills match our needed skills
    const recommendations = await User.find({
      _id: { $ne: req.user.id },
      skillsOffered: { $in: currentNeededSkills }
    })
      .select('name email location rating totalRatings bio skillsOffered skillsNeeded')
      .sort({ rating: -1 })
      .limit(20);

    const enrichedRecs = await Promise.all(
      recommendations.map(async (user) => {
        const matchingSkills = (user.skillsOffered || []).filter(s =>
          currentNeededSkills.includes(s)
        );
        const completedCount = await Request.countDocuments({
          $or: [{ fromUser: user._id }, { toUser: user._id }],
          status: 'completed'
        });
        return {
          ...user.toObject(),
          matchScore: matchingSkills.length,
          matchingSkills,
          completedExchanges: completedCount
        };
      })
    );

    res.json(enrichedRecs.sort((a, b) => b.matchScore - a.matchScore));
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   GET /api/users/badges/:id
// @desc    Get user badges
router.get('/badges/:id', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ unlockedBy: req.params.id });
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   POST /api/users/unlock-badge/:id
// @desc    Unlock badge for user (internal use)
router.post('/unlock-badge/:userId/:badgeType', auth, async (req, res) => {
  try {
    let badge = await Badge.findOne({ criteria: req.params.badgeType });
    
    if (!badge) {
      // Create badge if it doesn't exist
      const badgeTemplates = {
        first_exchange: { name: '🚀 First Exchange', description: 'Completed first skill exchange', icon: '🚀' },
        five_star_reviewer: { name: '⭐ Five Star Reviewer', description: 'Left a 5-star review', icon: '⭐' },
        skill_master: { name: '🎓 Skill Master', description: 'Mastered 5+ skills', icon: '🎓' },
        speed_demon: { name: '⚡ Speed Demon', description: 'Completed 10 exchanges', icon: '⚡' },
        helper: { name: '🤝 Helper', description: 'Helped 5+ users learn', icon: '🤝' }
      };

      const template = badgeTemplates[req.params.badgeType];
      badge = new Badge({
        name: template.name,
        description: template.description,
        icon: template.icon,
        criteria: req.params.badgeType,
        unlockedBy: [req.params.userId]
      });
    } else if (!badge.unlockedBy.includes(req.params.userId)) {
      badge.unlockedBy.push(req.params.userId);
    }

    await badge.save();
    res.json({ message: 'Badge unlocked!', badge });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;
