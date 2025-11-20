/* ----------------- CONFIG ----------------- */
const BACKEND = 'php'; // 'php' | 'node' | 'firebase' | 'flask'
const BASE_URL = (function(){
  if(BACKEND === 'php') return 'http://localhost/leaderboard_api'; // php api base
  if(BACKEND === 'node') return 'http://localhost:4000'; // node server
  if(BACKEND === 'flask') return 'http://localhost:5000'; // flask
  return ''; // firebase handled separately
})();

/* If using Firebase put your config here and set BACKEND = 'firebase' */
const FIREBASE_CONFIG = {
  apiKey: "API_KEY",
  authDomain: "PROJECT.firebaseapp.com",
  projectId: "PROJECT",
  storageBucket: "PROJECT.appspot.com",
  messagingSenderId: "",
  appId: ""
};
/* ------------------------------------------ */

document.addEventListener('DOMContentLoaded', ()=> {
  document.getElementById('year')?.textContent = new Date().getFullYear();
  if(location.pathname.endsWith('index.html') || location.pathname === '/' ) loadDashboardCards();
  if(location.pathname.endsWith('leaderboard.html')) loadLeaderboard();
  if(location.pathname.endsWith('study.html')) loadMaterials();
  if(location.pathname.endsWith('gallery.html')) loadGallery();
  if(location.pathname.endsWith('admin-login.html')) document.getElementById('loginForm').addEventListener('submit', adminLogin);
  if(location.pathname.endsWith('admin-dashboard.html')) initAdminDashboard();
});

/* Generic fetch wrapper for token/session */
async function apiFetch(path, opts={}){
  opts.headers = opts.headers || {};
  if(BACKEND !== 'firebase'){
    const token = localStorage.getItem('admin_token');
    if(token) opts.headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(BASE_URL + path, opts);
    if(res.status === 401) { localStorage.removeItem('admin_token'); location.href='admin-login.html'; }
    return res.json();
  } else {
    throw new Error('Use firebase functions for firebase backend');
  }
}

/* LOAD home cards */
async function loadDashboardCards(){
  if(BACKEND === 'firebase'){ await fbInit(); const stats = await fbGet('/dashboard/stats'); renderStats(stats); return; }
  try{
    const stats = await apiFetch('/api/dashboard/stats');
    renderStats(stats);
  }catch(e){ console.error(e);}
}
function renderStats(s){
  document.getElementById('topCount').textContent = (s?.top || 0) + ' top ranks';
  document.getElementById('matCount').textContent = (s?.materials || 0) + ' PDFs';
  document.getElementById('galCount').textContent = (s?.gallery || 0) + ' images';
}

/* Leaderboard */
async function loadLeaderboard(){
  if(BACKEND === 'firebase'){ await fbInit(); const data = await fbGet('/leaderboard'); renderLeaderboard(data); return; }
  try{
    const data = await apiFetch('/api/leaderboard');
    renderLeaderboard(data);
  }catch(e){ console.error(e); document.getElementById('leaderboard').textContent='Failed to load';}
}
function renderLeaderboard(items = []){
  const el = document.getElementById('leaderboard'); el.innerHTML='';
  items.sort((a,b)=> (b.score||0)-(a.score||0)).forEach((it,idx)=>{
    const row = document.createElement('div'); row.className='row';
    row.innerHTML = `<div><strong>${idx+1}. ${escapeHtml(it.name||'')}</strong><br><small class="muted">${escapeHtml(it.class||'')}</small></div><div><strong>${it.score}</strong></div>`;
    el.appendChild(row);
  });
}

/* Study materials */
async function loadMaterials(){
  if(BACKEND === 'firebase'){ await fbInit(); const data = await fbGet('/studymaterials'); renderMaterials(data); return; }
  try{
    const data = await apiFetch('/api/studymaterials');
    renderMaterials(data);
  }catch(e){ console.error(e);}
}
function renderMaterials(items=[]){
  const el = document.getElementById('materials'); el.innerHTML='';
  items.forEach(it=>{
    const a = document.createElement('a'); a.href = it.url; a.target='_blank'; a.className='card';
    a.innerHTML = `<h4>${escapeHtml(it.title)}</h4><p class="muted">${escapeHtml(it.description||'')}</p>`;
    el.appendChild(a);
  });
}

/* Gallery */
async function loadGallery(){
  if(BACKEND === 'firebase'){ await fbInit(); const data = await fbGet('/gallery'); renderGallery(data); return; }
  try{
    const data = await apiFetch('/api/gallery');
    renderGallery(data);
  }catch(e){ console.error(e);}
}
function renderGallery(imgs=[]){
  const el = document.getElementById('gallery'); el.innerHTML='';
  imgs.forEach(im=>{
    const d = document.createElement('div'); d.innerHTML = `<img src="${im.url}" alt="${escapeHtml(im.caption||'')}" />`;
    el.appendChild(d);
  });
}

/* ADMIN login */
async function adminLogin(e){
  e.preventDefault();
  const f = new FormData(e.target);
  const body = JSON.stringify({email:f.get('email'), password:f.get('password')});
  try{
    if(BACKEND === 'firebase'){ await fbInit(); await fbSignIn(f.get('email'), f.get('password')); location.href='admin-dashboard.html'; return; }
    const res = await fetch(BASE_URL + '/api/admin/login', {method:'POST', headers:{'Content-Type':'application/json'}, body});
    const j = await res.json();
    if(res.ok && j.token){
      localStorage.setItem('admin_token', j.token);
      location.href='admin-dashboard.html';
    } else { document.getElementById('err').textContent = j.message || 'Login failed'; }
  }catch(err){ document.getElementById('err').textContent = 'Server error'; console.error(err);}
}

/* Admin Dashboard initializers */
function initAdminDashboard(){
  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
  // load lists
  loadAdminStudents();
  loadAdminLeaderboard();
  loadAdminMaterials();
  loadAdminGallery();
  document.getElementById('addStudentBtn').addEventListener('click', ()=> openPromptAdd('student'));
  document.getElementById('addEntryBtn').addEventListener('click', ()=> openPromptAdd('leaderboard'));
  document.getElementById('uploadMatBtn').addEventListener('click', ()=> openPromptAdd('material'));
  document.getElementById('uploadImgBtn').addEventListener('click', ()=> openPromptAdd('image'));
  document.getElementById('changePassBtn').addEventListener('click', ()=> openChangePassword());
}

/* admin actions placeholders (illustrative) */
async function adminLogout(){
  if(BACKEND === 'firebase'){ await fbSignOut(); localStorage.removeItem('admin_token'); location.href='index.html'; return; }
  await apiFetch('/api/admin/logout',{method:'POST'});
  localStorage.removeItem('admin_token'); location.href='index.html';
}

/* load lists for admin */
async function loadAdminStudents(){
  try{
    const data = BACKEND==='firebase' ? await fbGet('/students') : await apiFetch('/api/students');
    const out = document.getElementById('studentsList'); out.innerHTML='';
    data.forEach(s=>{
      const div = document.createElement('div'); div.className='row';
      div.innerHTML = `<div><strong>${escapeHtml(s.name)}</strong> <small class="muted">${escapeHtml(s.class||'')}</small></div>
      <div><button class="btn ghost" onclick="editEntity('students','${s.id}')">Edit</button>
      <button class="btn" onclick="deleteEntity('students','${s.id}')">Delete</button></div>`;
      out.appendChild(div);
    });
  }catch(e){console.error(e)}
}
async function loadAdminLeaderboard(){ try{ const data = BACKEND==='firebase'? await fbGet('/leaderboard') : await apiFetch('/api/leaderboard'); const out=document.getElementById('leaderboardAdmin'); out.innerHTML=''; data.forEach(it=>{ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<div><strong>${escapeHtml(it.name)}</strong></div><div><button class="btn" onclick="deleteEntity('leaderboard','${it.id}')">Delete</button></div>`; out.appendChild(row);} ) }catch(e){console.error(e)}}
async function loadAdminMaterials(){ try{ const data = BACKEND==='firebase'? await fbGet('/studymaterials') : await apiFetch('/api/studymaterials'); const out=document.getElementById('materialsAdmin'); out.innerHTML=''; data.forEach(it=>{ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<div>${escapeHtml(it.title)}</div><div><a class="btn ghost" href="${it.url}" target="_blank">Open</a> <button class="btn" onclick="deleteEntity('studymaterials','${it.id}')">Delete</button></div>`; out.appendChild(row); }); }catch(e){console.error(e)}}
async function loadAdminGallery(){ try{ const data = BACKEND==='firebase'? await fbGet('/gallery') : await apiFetch('/api/gallery'); const out=document.getElementById('galleryAdmin'); out.innerHTML=''; data.forEach(it=>{ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<div><img src="${it.url}" style="height:48px;width:64px;object-fit:cover;border-radius:6px"/></div><div><button class="btn" onclick="deleteEntity('gallery','${it.id}')">Delete</button></div>`; out.appendChild(row); }); }catch(e){console.error(e)}}

/* generic create/delete/edit using prompt modals (simplified) */
function openPromptAdd(kind){
  // simplified prompt flow — you should replace with proper modal forms
  if(kind==='student'){
    const name = prompt('Student name'); if(!name) return;
    const cls = prompt('Class/Section'); const payload={name, class:cls};
    crudPost('/students', payload);
  } else if(kind==='leaderboard'){
    const name = prompt('Name'); const score = parseInt(prompt('Score')||'0');
    crudPost('/leaderboard', {name, score});
  } else if(kind==='material'){
    const title = prompt('Title'); const url = prompt('File URL (or upload later)'); crudPost('/studymaterials',{title, url});
  } else if(kind==='image'){
    const url = prompt('Image URL'); const caption = prompt('Caption'); crudPost('/gallery',{url, caption});
  }
}
async function crudPost(path, payload){
  try{
    if(BACKEND==='firebase'){ await fbPost(path, payload); location.reload(); return; }
    const res = await apiFetch('/api'+path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    if(res.ok === false) alert(res.message||'Error'); else location.reload();
  }catch(e){console.error(e); alert('Failed');}
}
async function deleteEntity(kind,id){
  if(!confirm('Delete?')) return;
  try{
    if(BACKEND==='firebase'){ await fbDelete(`/${kind}/${id}`); location.reload(); return; }
    const res = await apiFetch(`/api/${kind}/${id}`, {method:'DELETE'});
    if(res.ok===false) alert(res.message||'Error'); else location.reload();
  }catch(e){console.error(e); alert('Failed');}
}
function editEntity(kind,id){ alert('Edit function should open modal — implement UI.'); }

/* simple change password prompt */
async function openChangePassword(){
  const oldp = prompt('Old password'); const newp = prompt('New password'); if(!newp) return;
  try{
    if(BACKEND==='firebase'){ await fbChangePassword(oldp,newp); alert('Changed'); return; }
    const res = await apiFetch('/api/admin/change-password',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({old:oldp,new:newp})});
    alert(res.message || 'Done');
  }catch(e){console.error(e); alert('Failed');}
}

/* UTILS */
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

/* ---------------- Firebase helpers (simple wrappers) ---------------- */
let fbApp, fbAuth, fbDB, fbStorage;
async function fbInit(){
  if(typeof(firebase) === 'undefined'){
    // load firebase scripts dynamically
    await new Promise((res,rej)=>{
      const s1 = document.createElement('script'); s1.src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"; s1.onload=res; document.head.appendChild(s1);
    });
    await new Promise((res,rej)=>{
      const s2 = document.createElement('script'); s2.src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"; s2.onload=res; document.head.appendChild(s2);
    });
    await new Promise((res,rej)=>{
      const s3 = document.createElement('script'); s3.src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"; s3.onload=res; document.head.appendChild(s3);
    });
    await new Promise((res,rej)=>{
      const s4 = document.createElement('script'); s4.src="https://www.gstatic.com/firebasejs/9.22.2/firebase-storage-compat.js"; s4.onload=res; document.head.appendChild(s4);
    });
  }
  if(!fbApp){
    fbApp = firebase.initializeApp(FIREBASE_CONFIG);
    fbAuth = firebase.auth();
    fbDB = firebase.firestore();
    fbStorage = firebase.storage();
  }
}
async function fbSignIn(email,password){ await fbInit(); await fbAuth.signInWithEmailAndPassword(email,password); localStorage.setItem('admin_token','firebase'); }
async function fbSignOut(){ await fbInit(); await fbAuth.signOut(); localStorage.removeItem('admin_token'); }
async function fbGet(path){
  await fbInit();
  const coll = path.replace(/^\//,'');
  const snap = await fbDB.collection(coll).get();
  return snap.docs.map(d => ({id:d.id, ...d.data()}));
}
async function fbPost(path,payload){
  await fbInit();
  const coll = path.replace(/^\//,'').replace(/^\//,'');
  const r = await fbDB.collection(coll).add(payload);
  return r.id;
}
async function fbDelete(path){
  await fbInit();
  // path like /gallery/id or /students/id
  const parts = path.replace(/^\//,'').split('/');
  if(parts.length===2) await fbDB.collection(parts[0]).doc(parts[1]).delete();
  else throw new Error('invalid path');
}
async function fbChangePassword(oldp,newp){
  // Firebase requires re-authentication; prompt for email
  const user = fbAuth.currentUser;
  if(!user) throw new Error('Not authenticated');
  // Re-auth omitted for brevity — production must reauthenticate
  await user.updatePassword(newp);
}

/* ------------------------------------------------------------------- */

