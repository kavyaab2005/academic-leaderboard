const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {

  register: async (req, res) => {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({ name, email, password: hash });

    res.json({ success: true, message: "Registration successful!" });
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.json({ success: false, message: "Wrong password" });

    const token = jwt.sign({ id: admin._id }, "SECRET123");

    res.json({ success: true, token, message: "Login successful!" });
  },

};
