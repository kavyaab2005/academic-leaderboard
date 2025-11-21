const mongoose = require("../database/mongo");
const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});
module.exports = mongoose.model("Admin", AdminSchema);
