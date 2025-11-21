// routes/galleryRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');


router.get('/', galleryController.getGallery);
router.post('/upload', galleryController.uploadPhoto);


module.exports = router;
