// script.js — full replacement (copy-paste)
"use strict";

const DEBUG = true;
function log(...args){ if (DEBUG) console.log("[script.js]", ...args); }

function escapeHtml(text){
  return String(text || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function getBadgeForRank(i){
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  if (i === 3 || i === 4) return "🏅";
  return "";
}

function loadStudents(){
  try {
    return JSON.parse(localStorage.getItem("students")) || [];
  } catch (e) {
    console.error("Failed to parse students from localStorage:", e);
    return [];
  }
}
function saveStudents(arr){
  localStorage.setItem("students", JSON.stringify(arr));
}
function generateId(){
  return "s_" + Date.now() + "_" + Math.floor(Math.random()*10000);
}

function deleteStudentById(id){
  const students = loadStudents();
  const idx = students.findIndex(s => s.id == id);
  if (idx === -1) {
    log("deleteStudentById: id not found", id);
    return false;
  }
  students.splice(idx, 1);
  saveStudents(students);
  displayStudents();
  log("Deleted student id:", id);
  return true;
}

function addStudent(student){
  const students = loadStudents();
  student.id = student.id || generateId();
  students.push(student);
  saveStudents(students);
  displayStudents();
  return student.id;
}

function displayStudents(){
  try {
    const students = loadStudents();
    const sorted = students.slice().sort((a,b) => (parseFloat(b.cgpa)||0) - (parseFloat(a.cgpa)||0));

    // --- Public leaderboard ---
    const leaderboardTbody = document.querySelector("#leaderboardTable tbody");
    if (leaderboardTbody) {
      leaderboardTbody.innerHTML = "";
      sorted.forEach((s, i) => {
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        const badge = getBadgeForRank(i);
        if (badge) {
          const span = document.createElement("span");
          span.className = "student-badge";
          span.textContent = badge + " ";
          tdName.appendChild(span);
        }
        tdName.appendChild(document.createTextNode(escapeHtml(s.name || "")));
        tr.appendChild(tdName);

        ["roll","branch","year","sem","sgpa","cgpa"].forEach(key=>{
          const td = document.createElement("td");
          td.textContent = escapeHtml(s[key] || "");
          tr.appendChild(td);
        });

        leaderboardTbody.appendChild(tr);
      });
      log("Leaderboard rendered, count:", sorted.length);
    } else {
      log("No #leaderboardTable tbody found on page");
    }

    // --- Admin table (with delete) ---
    const adminTbody = document.querySelector("#adminStudentTable tbody");
    // IS_ADMIN determination: presence of #adminPanel or query/admin flag or localStorage flag
    window.IS_ADMIN = !!(document.querySelector("#adminPanel") || location.search.includes("admin=1") || localStorage.getItem("isAdmin") === "1");

    if (adminTbody && window.IS_ADMIN) {
      adminTbody.innerHTML = "";
      sorted.forEach((s, i) => {
        const tr = document.createElement("tr");

        const tdRank = document.createElement("td");
        tdRank.textContent = i + 1;
        tr.appendChild(tdRank);

        const tdName = document.createElement("td");
        const badge = getBadgeForRank(i);
        if (badge) {
          const span = document.createElement("span");
          span.className = "student-badge";
          span.textContent = badge + " ";
          tdName.appendChild(span);
        }
        tdName.appendChild(document.createTextNode(escapeHtml(s.name || "")));
        tr.appendChild(tdName);

        ["roll","branch","year","sem","sgpa","cgpa"].forEach(key=>{
          const td = document.createElement("td");
          td.textContent = escapeHtml(s[key] || "");
          tr.appendChild(td);
        });

        const tdAction = document.createElement("td");
        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "🗑 Delete";
        del.onclick = () => {
          if (confirm("Delete this student?")) deleteStudentById(s.id);
        };
        tdAction.appendChild(del);
        tr.appendChild(tdAction);

        adminTbody.appendChild(tr);
      });
      log("Admin student table rendered, count:", sorted.length);
    } else {
      log("Admin table skipped (either no #adminStudentTable tbody or not admin)");
    }
  } catch (err) {
    console.error("displayStudents() failed:", err);
  }
}

// Attach admin form (if present) to add students
function attachAdminForm(){
  const form = document.querySelector("#adminForm");
  if (!form) {
    log("No #adminForm found (skipping form hook)");
    return;
  }
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const student = {
      name: fd.get("name") || "",
      roll: fd.get("roll") || "",
      branch: fd.get("branch") || "",
      year: fd.get("year") || "",
      sem: fd.get("sem") || "",
      sgpa: fd.get("sgpa") || "",
      cgpa: fd.get("cgpa") || ""
    };
    addStudent(student);
    form.reset();
  });
}

// helpful debug/demo data insertion (only runs once if DEBUG and no students exist)
function seedDemoDataIfNeeded(){
  try {
    const students = loadStudents();
    if (students.length === 0 && DEBUG && !localStorage.getItem("students_demo_seeded")) {
      const demo = [
        { name:"Asha", roll:"101", branch:"CSE", year:"2", sem:"4", sgpa:"9.1", cgpa:"8.6" },
        { name:"Balu", roll:"102", branch:"CSE", year:"2", sem:"4", sgpa:"8.9", cgpa:"8.4" },
        { name:"Charu", roll:"103", branch:"ECE", year:"2", sem:"4", sgpa:"8.7", cgpa:"8.2" },
        { name:"Dinesh", roll:"104", branch:"ME", year:"2", sem:"4", sgpa:"8.5", cgpa:"7.9" }
      ];
      demo.forEach(s => { s.id = generateId(); });
      saveStudents(demo);
      localStorage.setItem("students_demo_seeded", "1");
      log("Demo students seeded");
    }
  } catch (e) {
    console.error("seedDemoDataIfNeeded error:", e);
  }
}

// global error handler to catch runtime errors quickly
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Unhandled error:", message, source, lineno, colno, error);
  // show a small alert so you know something crashed — check console for full trace
  alert("Script error: " + message + "\nOpen browser console for details.");
};

window.addEventListener("DOMContentLoaded", () => {
  seedDemoDataIfNeeded();
  attachAdminForm();
  displayStudents();
});
