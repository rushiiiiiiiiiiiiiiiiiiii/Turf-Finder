const mongoose = require('mongoose');

const UserLoginSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  role:String,
});

module.exports = mongoose.model('UserLogin', UserLoginSchema);
