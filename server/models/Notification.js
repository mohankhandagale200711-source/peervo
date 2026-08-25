const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Recipient
  },
  type: {
    type: String,
    enum: ['star', 'message', 'comment'],
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemRef: {
    itemType: {
      type: String,
      enum: ['project', 'note', 'chat'],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
