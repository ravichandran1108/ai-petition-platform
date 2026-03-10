const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
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
    enum: ['Environment', 'Education', 'Transport', 'Health', 'Community', 'Other'],
    default: 'Other'
  },
  targetSignatures: {
    type: Number,
    required: true,
    min: 1
  },
  signatureCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signatures: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    comment: String,
    location: {
      lat: Number,
      lng: Number
    },
    signedAt: {
      type: Date,
      default: Date.now
    }
  }],
  governmentResponseStatus: {
    type: String,
    enum: ['Not Sent', 'Sent', 'Viewed', 'Responded', 'Implemented'],
    default: 'Not Sent'
  },
  governmentResponseText: {
    type: String
  },
  governmentLastUpdated: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Petition', petitionSchema); 