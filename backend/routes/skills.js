const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

// Input validation helper
const validateSkillInput = (title, description, category, location) => {
  const errors = [];
  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters');
  if (!description || description.trim().length < 10) errors.push('Description must be at least 10 characters');
  if (!category) errors.push('Category is required');
  if (!location || location.trim().length < 2) errors.push('Location is required');
  return errors;
};

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, location, skillsWanted } = req.body;
    
    // Validate input
    const validationErrors = validateSkillInput(title, description, category, location);
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: 'Validation errors', errors: validationErrors });
    }

    const skill = new Skill({
      user: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      skillsWanted
    });
    await skill.save();
    res.status(201).json({ message: 'Skill posted successfully!', skill });
  } catch (error) {
    console.error('Error posting skill:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ isAvailable: true })
      .populate('user', 'name location bio rating totalRatings skillsOffered reviews')
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});

// @route   GET /api/skills/search/advanced
// @desc    Advanced search with filters (category, location, rating)
router.get('/search/advanced', async (req, res) => {
  try {
    const { category, location, minRating, keyword } = req.query;
    let query = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    let skills = await Skill.find(query)
      .populate('user', 'name location bio rating totalRatings skillsOffered reviews')
      .sort({ createdAt: -1 });

    // Filter by user rating
    if (minRating) {
      skills = skills.filter(skill => skill.user.rating >= parseFloat(minRating));
    }

    res.json(skills);
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   PUT /api/skills/:id
// @desc    Edit a skill
router.put('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found!' });
    if (skill.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this skill!' });
    }
    
    // Validate input if provided
    const { title, description, category, location } = req.body;
    if (title || description || category || location) {
      const validationErrors = validateSkillInput(
        title || skill.title,
        description || skill.description,
        category || skill.category,
        location || skill.location
      );
      if (validationErrors.length > 0) {
        return res.status(400).json({ message: 'Validation errors', errors: validationErrors });
      }
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Skill updated!', skill: updatedSkill });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found!' });
    if (skill.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this skill!' });
    }
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully!' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});
// @route   GET /api/skills/my
// @desc    Get my skills (must come before /:id route)
router.get('/my', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});

// @route   GET /api/skills/:id
// @desc    Get single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('user', 'name location bio rating totalRatings skillsOffered reviews');
    if (!skill) return res.status(404).json({ message: 'Skill not found!' });
    res.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    res.status(500).json({ message: 'Server error!', error: error.message });
  }
});

module.exports = router;