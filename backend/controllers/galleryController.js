// controllers/galleryController.js
// =============================================
module.exports = {
getGallery: (req, res) => {
res.json([{ id: 1, image: 'event1.jpg' }]);
},


uploadPhoto: (req, res) => {
res.json({ message: 'Photo uploaded successfully' });
}
};
