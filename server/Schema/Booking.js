const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserLogin',
    required: true,
  },
  turf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming the owner is also from the User model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  advanceAmount: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  upiRef: {
    type: String,
  },
  screenshot: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
