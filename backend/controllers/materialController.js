// =============================================
// controllers/materialController.js
// =============================================
module.exports = {
getMaterials: (req, res) => {
res.json([{ id: 1, title: 'DBMS Notes', file: 'dbms.pdf' }]);
},


uploadMaterial: (req, res) => {
res.json({ message: 'Material uploaded successfully' });
}
};
