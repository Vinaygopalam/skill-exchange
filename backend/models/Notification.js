const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['request', 'message', 'review', 'skill_interest', 'request_status'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Reference to request, message, review, or skill'
    },
    relatedType: {
      type: String,
      enum: ['Request', 'Message', 'Review', 'Skill', 'User']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String,
      description: 'URL to navigate to when notification is clicked'
    }
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
