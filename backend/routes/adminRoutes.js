// =============================================
// routes/adminRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');



router.post("/register", adminController.register);
router.post("/login", adminController.login);



module.exports = router;
