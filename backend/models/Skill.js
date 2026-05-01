const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology',
      'Agriculture',
      'Handicrafts',
      'Education',
      'Health',
      'Music',
      'Cooking',
      'Construction',
      'Other'
    ]
  },
  location: {
    type: String,
    required: true
  },
  skillsWanted: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skill', SkillSchema);