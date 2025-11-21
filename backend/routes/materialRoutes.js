// =============================================
// routes/materialRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');


router.get('/', materialController.getMaterials);
router.post('/upload', materialController.uploadMaterial);


module.exports = router;
