const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, location, skillsWanted } = req.body;
    const skill = new Skill({
      user: req.user.id,
      title,
      description,
      category,
      location,
      skillsWanted
    });
    await skill.save();
    res.status(201).json({ message: 'Skill posted successfully!', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ isAvailable: true })
      .populate('user', 'name location')
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
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
      return res.status(401).json({ message: 'Not authorized!' });
    }
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    res.json({ message: 'Skill updated!', skill: updatedSkill });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found!' });
    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized!' });
    }
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});
// @route   GET /api/skills/:id
// @desc    Get single skill
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('user', 'name location');
    if (!skill) return res.status(404).json({ message: 'Skill not found!' });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});
// @route   GET /api/skills/my
// @desc    Get my skills
router.get('/my', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;