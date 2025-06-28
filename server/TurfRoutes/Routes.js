const express = require("express");
const multer = require("multer");
const path = require("path");
const { registerTurf, UserSignup, UserLogin, getAllTurfs, getTurfById, getSlotsByTurfId, getOneTurfById,
   addSlots, createBooking,getBookingsByUser, getAllSlots, slotBooked, getBookingsByOwner, updateTurf,
   getAllBookings, getAllUsers} = require("../TurfController/Contoller");

const router = express.Router();

// Store in uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 25 * 1024 * 1024,     // Max size per field (25MB)
    fileSize: 20 * 1024 * 1024,      // Max size per file (20MB)
    files: 10,                       // Max number of files
    fields: 30,                      // Max number of non-file fields
    fieldNameSize: 255               // Max size of field name (in bytes)
  }
});


router.post("/useregister", UserSignup);
router.post("/login", UserLogin);
router.get("/getallturf", getAllTurfs);
router.post("/register", upload.array("images", 10), registerTurf);
router.get('/getturfdetails/:ownerid', getTurfById);
router.post('/addslots', addSlots);
router.get('/getslots/:turfId', getSlotsByTurfId);
router.get('/getoneturf/:id', getOneTurfById);
router.get('/getallturfslots', getAllSlots);
router.get('/getAllBookings', getAllBookings);
router.get('/getAllUsers', getAllUsers);
router.post('/createbooking', upload.single('screenshot'), createBooking);
router.get('/bookingofuser/:userid', getBookingsByUser);
router.get('/getBookingsByOwner/:ownerid', getBookingsByOwner);
router.patch("/slotbooked/:slotId", slotBooked);
router.put('/updateTurf/:turfId', upload.array('images'), updateTurf);
module.exports = router;
