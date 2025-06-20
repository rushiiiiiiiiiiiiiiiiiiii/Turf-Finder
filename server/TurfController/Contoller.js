const UserLogin = require('../Schema/Login');
const Turf = require('../Schema/TurfDetails');
const Slot = require('../Schema/Slot');
const bcrypt = require('bcrypt');
const Booking = require('../Schema/Booking');
const moment = require("moment");
// ---------------- USER SIGNUP ----------------
exports.UserSignup = async (req, res) => {
  const { name, phone, password, role } = req.body;

  try {
    const existingUser = await UserLogin.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserLogin.create({
      name,
      phone,
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ---------------- USER LOGIN ----------------
exports.UserLogin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    let user = await UserLogin.findOne({ phone });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid phone or password" });

      return res.json({
        message: "Login successful",
        user: {
          _id: user._id,
          phone: user.phone,
          role: user.role
        }
      });
    }

    const owner = await Turf.findOne({ ownerPhone: phone });
    if (owner) {
      const isMatch = await bcrypt.compare(password, owner.ownerPassword);
      if (!isMatch) return res.status(401).json({ message: "Invalid phone or password" });

      return res.json({
        message: "Login successful",
        user: {
          _id: owner._id,
          phone: owner.ownerPhone,
          role: "owner"
        }
      });
    }

    return res.status(401).json({ message: "Invalid phone or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- TURF REGISTRATION ----------------
exports.registerTurf = async (req, res) => {
  try {
    const {
      name, location, address, city, state, pincode,
      ownerName, ownerEmail, ownerPhone, ownerPassword,
      sports, amenities, pricePerHour, description,
      MinBookingPrice, ownerId
    } = req.body;


    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const imagePaths = req.files.map(file => file.path);

    const turf = await Turf.create({
      name,
      location,
      address,
      city,
      state,
      pincode,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword: hashedPassword,
      sports: Array.isArray(sports) ? sports : [sports],
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      pricePerHour,
      description,
      MinBookingPrice,
      ownerId,
      images: imagePaths
    });


    res.status(201).json({ message: "Turf registered", turf });
  } catch (err) {
    console.error(err); getOneTurfById
    res.status(500).json({ message: "Failed to register turf" });
  }
};

// ---------------- FETCH ALL TURFS ----------------
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.status(200).json({ turfs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch turfs" });
  }
};

// ---------------- GET TURFS BY OWNER ID ----------------
exports.getTurfById = async (req, res) => {
  const { ownerid } = req.params;
  try {
    const turfs = await Turf.find({ ownerId:ownerid });
    res.status(200).json({ turfs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch turf" });
  }
};

exports.updateTurf = async (req, res) => {
  try {
    const updateFields = { ...req.body };

    // Combine existing and new image paths
    const existingImages = req.body.existingImages || [];
    let images = Array.isArray(existingImages) ? existingImages : [existingImages];

    if (req.files?.length) {
      const newImages = req.files.map(file => file.path);
      images = images.concat(newImages);
    }

    updateFields.images = images;

    const updated = await Turf.findByIdAndUpdate(req.params.turfId, updateFields, { new: true });

    if (!updated) return res.status(404).json({ message: "Turf not found" });

    res.json({ message: "Turf updated successfully", turf: updated });
  } catch (error) {
    console.error("Error updating turf:", error);
    res.status(500).json({ message: "Server error while updating turf" });
  }
};

// ---------------- GET SINGLE TURF BY ID ----------------
exports.getOneTurfById = async (req, res) => {
  const { id } = req.params;
  try {
    const turfs = await Turf.findById({ _id: id });
    res.status(200).json({ turfs });
    console.log(turfs)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch turf" });
  }
};

// ---------------- GET ALL SLOTS ----------------
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json({ success: true, slots });
  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const Bookings = await Booking.find();
    res.status(200).json({ success: true, Bookings });
  } catch (err) {
    console.error('Error fetching Bookings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getBookingsByOwner = async (req, res) => {
  const {ownerid} = req.params;
  try {
    const Bookings = await Booking.find({ownerId:ownerid});
    res.status(200).json({ success: true, Bookings });
  } catch (err) {
    console.error('Error fetching Bookings:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const AllUsers = await UserLogin.find();
    res.status(200).json({ success: true, AllUsers });
  } catch (err) {
    console.error('Error fetching AllUsers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addSlots = async (req, res) => {
  const { turfId, ownerId, slots } = req.body;
  if (!turfId || !ownerId || !Array.isArray(slots)) return res.status(400).json({ message: "Invalid input" });

  const existing = await Slot.findOne({ turfId });
  if (existing) {
    existing.slots = slots;
    await existing.save();
    return res.json({ message: "Slots updated" });
  }

  await Slot.create({ turfId, ownerId, slots });
  res.status(201).json({ message: "Slots created" });
};


exports.getSlotsByTurfId = async (req, res) => {
  const { turfId } = req.params;
  const dateStr = req.query.date;
  if (!dateStr) return res.status(400).json({ message: "Date is required" });

  const master = await Slot.findOne({ turfId });
  if (!master) return res.status(404).json({ message: "No slots defined for this turf" });

  const now = moment();
  const reqDate = moment(dateStr, "YYYY-MM-DD");
  const isToday = reqDate.isSame(now, "day");

  const dayBookings = await Booking.find({
    turf: turfId,
    date: { $gte: reqDate.startOf('day').toDate(), $lte: reqDate.endOf('day').toDate() },
  });
  const bookedIds = dayBookings.map(b => b.slotId.toString());

  const result = master.slots.map(sl => {
    const slotMoment = moment(`${dateStr} ${sl.start}`, "YYYY-MM-DD HH:mm");
    let available = true;

    if (isToday && now.isSameOrAfter(slotMoment)) available = false;
    if (bookedIds.includes(sl._id.toString())) available = false;

    return {
      id: sl._id,
      start: sl.start,
      end: sl.end,
      price: sl.price,
      available
    };
  });

  return res.json({ date: dateStr, slots: result });
};

exports.createBooking = async (req, res) => {
  const { userId, turfId, ownerId, date, slotId, slotTime, totalAmount, advanceAmount, remainingAmount, upiRef } = req.body;
  if (!userId || !turfId || !ownerId || !date || !slotId || !slotTime || !upiRef) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const screenshotPath = req.file?.path;
  if (!screenshotPath) {
    return res.status(400).json({ message: "Screenshot is required" });
  }

  const bookingDate = moment(date, moment.ISO_8601).startOf('day').toDate();

  const existing = await Booking.findOne({ turf: turfId, slotId, date: { $gte: bookingDate, $lte: moment(bookingDate).endOf('day').toDate() } });
  if (existing) {
    return res.status(400).json({ message: "Slot already booked for this date" });
  }

  const booking = await Booking.create({
    user: userId,
    turf: turfId,
    ownerId,
    date: bookingDate,
    slotId,
    slotTime,
    totalAmount,
    advanceAmount,
    remainingAmount,
    upiRef,
    screenshot: screenshotPath,
  });

  res.status(201).json({ message: "Booking successful", booking });
};

exports.getBookingsByUser = async (req, res) => {
  const userid = req.params.userid || req.query.userid || req.body.userid;

  try {
    const bookings = await Booking.find({ user: userid });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSlotsByTurfId = async (req, res) => {
  const { turfId } = req.params;
  const dateStr = req.query.date; // “YYYY‑MM‑DD” in **local time**

  if (!dateStr) return res.status(400).json({ message: "Date is required" });

  const master = await Slot.findOne({ turfId });
  if (!master) return res.status(404).json({ message: "No slots defined for this turf" });

  const now = moment();
  const reqDate = moment(dateStr, "YYYY-MM-DD");
  const isToday = reqDate.isSame(now, "day");

  const dayBookings = await Booking.find({
    turf: turfId,
    date: { $gte: reqDate.clone().startOf('day').toDate(), $lte: reqDate.clone().endOf('day').toDate() }
  });

  const bookedIds = new Set(dayBookings.map(b => b.slotId.toString()));

  const slots = master.slots.map(sl => {
    const slotMoment = moment(`${dateStr} ${sl.start}`, "YYYY-MM-DD HH:mm");
    let available = true;
    if (isToday && now.isSameOrAfter(slotMoment)) available = false;
    if (bookedIds.has(sl._id.toString())) available = false;
    return {
      id: sl._id,
      start: sl.start,
      end: sl.end,
      price: sl.price,
      available
    };
  });

  return res.json({ date: dateStr, slots });
};

exports.slotBooked = async (req, res) => {
  const { slotId } = req.params;

  if (!slotId) {
    return res.status(400).json({ message: "No slotId provided in params" });
  }

  try {
    const updatedDoc = await Slot.findOneAndUpdate(
      { "slots._id": slotId },
      { $set: { "slots.$.availability": false } },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const updatedSlot = updatedDoc.slots.find(
      (slot) => slot._id.toString() === slotId
    );

    res.json({
      message: "Slot updated successfully",
      updatedSlot,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating slot", error: err.message });
  }
};
