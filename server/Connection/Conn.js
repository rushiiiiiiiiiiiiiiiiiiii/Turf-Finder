const mongoose = require('mongoose');
require('dotenv').config(); 

const Conn = mongoose.connect(process.env.Mongo_url, {
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = Conn;
