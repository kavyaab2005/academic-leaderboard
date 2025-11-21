const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors()); app.use(express.json());

const JWT_SECRET = 'devsecret';

// Connect MongoDB
mongoose.connect('mongodb://localhost/leaderboard', {useNewUrlParser:true, useUnifiedTopology:true});

// Schemas
const Admin = mongoose.model('Admin', new mongoose.Schema({email:{type:String,unique:true}, password:String}));
const Student = mongoose.model('Student', new mongoose.Schema({name:String, class:String}));
const Leaderboard = mongoose.model('Leaderboard', new mongoose.Schema({name:String, score:Number}));
const Material = mongoose.model('Material', new mongoose.Schema({title:String, url:String, description:String}));
const Gallery = mongoose.model('Gallery', new mongoose.Schema({url:String, caption:String}));

// seed admin if not exists
(async ()=>{
  const a = await Admin.findOne({email:'admin@example.com'});
  if(!a){ const hash = await bcrypt.hash('password123',10); await Admin.create({email:'admin@example.com', password:hash}); console.log('Admin seeded'); }
})();

function auth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({message:'unauthorized'});
  try{ const data = jwt.verify(token,JWT_SECRET); req.admin = data; next(); }catch(e){ res.status(401).json({message:'unauthorized'}); }
}

app.post('/api/admin/login', async (req,res)=>{
  const {email,password} = req.body;
  const a = await Admin.findOne({email});
  if(!a) return res.status(401).json({message:'Invalid'});
  const ok = await bcrypt.compare(password, a.password);
  if(!ok) return res.status(401).json({message:'Invalid'});
  const token = jwt.sign({id:a._id,email:a.email}, JWT_SECRET, {expiresIn:'8h'});
  res.json({token});
});

// Students
app.get('/api/students', async (req,res)=> res.json(await Student.find()));
app.post('/api/students', auth, async (req,res)=> { await Student.create(req.body); res.json({ok:true}); });
app.delete('/api/students/:id', auth, async (req,res)=> { await Student.findByIdAndDelete(req.params.id); res.json({ok:true}); });

// Leaderboard
app.get('/api/leaderboard', async (req,res)=> res.json(await Leaderboard.find().sort({score:-1})));
app.post('/api/leaderboard', auth, async (req,res)=> { await Leaderboard.create(req.body); res.json({ok:true}); });
app.delete('/api/leaderboard/:id', auth, async (req,res)=> { await Leaderboard.findByIdAndDelete(req.params.id); res.json({ok:true}); });

// Materials & Gallery
app.get('/api/studymaterials', async (req,res)=> res.json(await Material.find().sort({createdAt:-1})));
app.post('/api/studymaterials', auth, async (req,res)=> { await Material.create(req.body); res.json({ok:true}); });
app.delete('/api/studymaterials/:id', auth, async (req,res)=> { await Material.findByIdAndDelete(req.params.id); res.json({ok:true}); });

app.get('/api/gallery', async (req,res)=> res.json(await Gallery.find().sort({createdAt:-1})));
app.post('/api/gallery', auth, async (req,res)=> { await Gallery.create(req.body); res.json({ok:true}); });
app.delete('/api/gallery/:id', auth, async (req,res)=> { await Gallery.findByIdAndDelete(req.params.id); res.json({ok:true}); });

// Dashboard stats
app.get('/api/dashboard/stats', async (req,res)=>{
  const top = await Leaderboard.countDocuments();
  const materials = await Material.countDocuments();
  const gallery = await Gallery.countDocuments();
  res.json({top,materials,gallery});
});

app.listen(4000, ()=>console.log('node api on 4000'));
