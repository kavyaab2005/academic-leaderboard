// controllers/adminController.js
// =============================================
module.exports = {
login: (req, res) => {
const { email, password } = req.body;
if (email === 'admin@example.com' && password === 'admin123') {
res.json({ success: true, token: 'ADMIN-TOKEN-123' });
} else {
res.json({ success: false, message: 'Invalid Credentials' });
}
},


getStats: (req, res) => {
res.json({ students: 240, materials: 89, gallery: 65 });
}
};
