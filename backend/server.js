/* ----------------------------------------------------
   Academic Leaderboard - Backend (server.js)
---------------------------------------------------- */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

/* ----------------------------------------------------
   FILE UPLOAD CONFIG (multer)
---------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 10000) + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });

/* ----------------------------------------------------
   DATABASE FILES (JSON local DB)
---------------------------------------------------- */
const db = {
  students: "db/students.json",
  materials: "db/materials.json",
  gallery: "db/gallery.json",
  events: "db/events.json",
};

// Read DB helper
function readDB(file) {
  if (!fs.existsSync(file)) return [];
  let data = fs.readFileSync(file);
  return JSON.parse(data || "[]");
}

// Write DB helper
function writeDB(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ----------------------------------------------------
   ROUTES
---------------------------------------------------- */

/* ------------------ Students ------------------ */
app.get("/students", (req, res) => {
  res.json(readDB(db.students));
});

app.post("/students", (req, res) => {
  let students = readDB(db.students);
  const newStudent = {
    id: Date.now(),
    name: req.body.name,
    marks: req.body.marks,
    dept: req.body.dept,
    rank: req.body.rank,
  };
  students.push(newStudent);
  writeDB(db.students, students);
  res.json({ message: "Student added", student: newStudent });
});

/* ------------------ Study Materials ------------------ */
app.get("/materials", (req, res) => {
  res.json(readDB(db.materials));
});

app.post("/materials", (req, res) => {
  let materials = readDB(db.materials);
  const newMaterial = {
    id: Date.now(),
    title: req.body.title,
    url: req.body.url,
    subject: req.body.subject,
  };
  materials.push(newMaterial);
  writeDB(db.materials, materials);
  res.json({ message: "Material added", material: newMaterial });
});

/* ------------------ Gallery Photos ------------------ */
app.get("/gallery", (req, res) => {
  res.json(readDB(db.gallery));
});

app.post("/gallery", upload.single("photo"), (req, res) => {
  let gallery = readDB(db.gallery);
  const newPhoto = {
    id: Date.now(),
    image: req.file.filename,
  };
  gallery.push(newPhoto);
  writeDB(db.gallery, gallery);
  res.json({ message: "Photo uploaded", photo: newPhoto });
});

/* ------------------ Events ------------------ */
app.get("/events", (req, res) => {
  res.json(readDB(db.events));
});

app.post("/events", upload.single("eventImage"), (req, res) => {
  let events = readDB(db.events);
  const newEvent = {
    id: Date.now(),
    title: req.body.title,
    date: req.body.date,
    location: req.body.location,
    description: req.body.description,
    image: req.file ? req.file.filename : null,
  };

  events.push(newEvent);
  writeDB(db.events, events);
  res.json({ message: "Event added", event: newEvent });
});

/* ----------------------------------------------------
   START SERVER
---------------------------------------------------- */
app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});
