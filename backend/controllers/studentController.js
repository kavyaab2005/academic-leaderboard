// controllers/studentController.js
// =============================================
let students = [];


module.exports = {
getStudents: (req, res) => {
res.json(students);
},


addStudent: (req, res) => {
students.push(req.body);
res.json({ message: 'Student added', students });
}
};
