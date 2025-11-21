// =============================================
// routes/adminRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');


router.post('/login', adminController.login);
router.get('/stats', auth, adminController.getStats);


module.exports = router;
