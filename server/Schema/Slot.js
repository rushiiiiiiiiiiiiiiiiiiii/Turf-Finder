const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start: String,
  end: String,
  price: Number,
  availability: {
    type: Boolean,
    default: true,
  },
});

const slotGroupSchema = new mongoose.Schema({
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Turf",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  slots: [slotSchema],
});

module.exports = mongoose.model("Slot", slotGroupSchema);
