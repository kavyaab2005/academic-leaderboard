"use strict";

const DEBUG = true;
function log(...args) { if (DEBUG) console.log("[script.js]", ...args); }

// ===== Admin Config =====
const ADMIN_PASSWORD = "password123"; // change to your real password

function isAdmin() {
  return localStorage.getItem("isAdmin") === "1";
}

function loginAdmin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "1");
    alert("✅ Admin logged in successfully.");
    displayAdminInterface();
  } else {
    alert("❌ Invalid password");
    displayPublicInterface();
  }
}

function logoutAdmin() {
  localStorage.removeItem("isAdmin");
  alert("✅ Admin logged out.");
  displayPublicInterface();
}

// ===== Helpers =====
function generateId(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

// ===== STUDENTS =====
function loadStudents() { return JSON.parse(localStorage.getItem("students") || "[]"); }
function saveStudents(arr) { localStorage.setItem("students", JSON.stringify(arr)); }

function getBadgeForRank(i) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  if (i === 3 || i === 4) return "🏅";
  return "";
}

function addStudent(student) {
  if (!isAdmin()) return alert("❌ Only admin can add!");
  const students = loadStudents();
  student.id = generateId("s");
  students.push(student);
  saveStudents(students);
  displayStudents();
}

function deleteStudentById(id) {
  if (!isAdmin()) return alert("❌ Only admin can delete!");
  let students = loadStudents().filter(s => s.id !== id);
  saveStudents(students);
  displayStudents();
}

function displayStudents() {
  const students = loadStudents();
  const sorted = students.slice().sort((a, b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0));

  // public leaderboard
  const tbody = document.querySelector("#leaderboardTable tbody");
  if (tbody) {
    tbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const tr = document.createElement("tr");
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) { tdName.innerHTML = `<span class="student-badge">${badge}</span> `; }
      tdName.appendChild(document.createTextNode(s.name));
      tr.appendChild(tdName);
      ["roll", "branch", "year", "sem", "sgpa", "cgpa"].forEach(k => {
        const td = document.createElement("td");
        td.textContent = s[k];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // admin table
  const adminTbody = document.querySelector("#adminStudentTable tbody");
  if (adminTbody && isAdmin()) {
    adminTbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td>${s.roll}</td>
        <td>${s.branch}</td>
        <td>${s.year}</td>
        <td>${s.sem}</td>
        <td>${s.sgpa}</td>
        <td>${s.cgpa}</td>
      `;
      const tdAct = document.createElement("td");
      const del = document.createElement("button");
      del.textContent = "🗑 Delete";
      del.onclick = () => deleteStudentById(s.id);
      tdAct.appendChild(del);
      tr.appendChild(tdAct);
      adminTbody.appendChild(tr);
    });
  }
}

// ===== EVENTS =====
function loadEvents() { return JSON.parse(localStorage.getItem("events") || "[]"); }
function saveEvents(arr) { localStorage.setItem("events", JSON.stringify(arr)); }

function addEvent(text) {
  if (!isAdmin()) return alert("❌ Only admin can add!");
  const events = loadEvents();
  events.push({ id: generateId("e"), text });
  saveEvents(events);
  displayEvents();
}

function deleteEventById(id) {
  if (!isAdmin()) return alert("❌ Only admin can delete!");
  saveEvents(loadEvents().filter(e => e.id !== id));
  displayEvents();
}

function displayEvents() {
  const events = loadEvents();

  // public marquee
  const marquee = document.querySelector("#eventsMarquee");
  if (marquee) marquee.textContent = events.map(e => e.text).join(" • ");

  // admin list
  const adminList = document.querySelector("#adminEventsList");
  if (adminList && isAdmin()) {
    adminList.innerHTML = "";
    events.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = ev.text + " ";
      const del = document.createElement("button");
      del.textContent = "🗑 Delete";
      del.onclick = () => deleteEventById(ev.id);
      li.appendChild(del);
      adminList.appendChild(li);
    });
  }
}

// ===== MATERIALS =====
function loadMaterials() { return JSON.parse(localStorage.getItem("materials") || "[]"); }
function saveMaterials(arr) { localStorage.setItem("materials", JSON.stringify(arr)); }

function addMaterial(title, link) {
  if (!isAdmin()) return alert("❌ Only admin can add!");
  const mats = loadMaterials();
  mats.push({ id: generateId("m"), title, link });
  saveMaterials(mats);
  displayMaterials();
}

function deleteMaterialById(id) {
  if (!isAdmin()) return alert("❌ Only admin can delete!");
  saveMaterials(loadMaterials().filter(m => m.id !== id));
  displayMaterials();
}

function displayMaterials() {
  const mats = loadMaterials();

  // public list
  const list = document.querySelector("#materialsList");
  if (list) {
    list.innerHTML = "";
    mats.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.textContent = m.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // admin list
  const adminList = document.querySelector("#adminMaterialsList");
  if (adminList && isAdmin()) {
    adminList.innerHTML = "";
    mats.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.textContent = m.title;
      li.appendChild(a);
      const del = document.createElement("button");
      del.textContent = "🗑 Delete";
      del.onclick = () => deleteMaterialById(m.id);
      li.appendChild(del);
      adminList.appendChild(li);
    });
  }
}

// ===== Init =====
window.addEventListener("DOMContentLoaded", () => {
  if (!isAdmin()) {
    const pwd = prompt("Enter Admin Password:");
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem("isAdmin", "1");
      displayAdminInterface();
    } else {
      alert("❌ Wrong password. Showing public view.");
      displayPublicInterface();
    }
  } else {
    displayAdminInterface();
  }

  displayStudents();
  displayEvents();
  displayMaterials();

  // Logout Button
  const logoutBtn = document.querySelector("#logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logoutAdmin();
    });
  }
});

// Show Admin Interface
function displayAdminInterface() {
  document.querySelector("#adminPanel").style.display = "block";
  document.querySelector("#loginPanel").style.display = "none";
}

// Show Public Interface
function displayPublicInterface() {
  document.querySelector("#adminPanel").style.display = "none";
  document.querySelector("#loginPanel").style.display = "block";
}
