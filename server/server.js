const express = require('express');
const cors = require('cors');
const Conn = require('./Connection/Conn');
const Routes = require('./TurfRoutes/Routes');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // to serve images
app.use("/turf", Routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
