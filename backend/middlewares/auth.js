// middlewares/auth.js
// =============================================
module.exports = (req, res, next) => {
const token = req.headers.authorization;
if (token === 'ADMIN-TOKEN-123') next();
else res.json({ message: 'Unauthorized' });
};
