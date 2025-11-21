// database/mongo.js
// =============================================
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/studentportal');
module.exports = mongoose;
