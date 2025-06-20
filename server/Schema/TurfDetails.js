const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: String,
  location: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  ownerName: String,
  ownerEmail: String,
  ownerPhone: String,
  ownerPassword: String,
  sports: [String],
  amenities: [String],
  pricePerHour: String,
  description: String,
  images: [String], // store file paths
  MinBookingPrice: {
  type: Number,
  required: true,
},
ownerId: {
  type: mongoose.Schema.Types.ObjectId, // or String if you're storing it as a string
  ref: 'User',
  required: true
},
});

module.exports = mongoose.model('Turf', TurfSchema);
