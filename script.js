// script.js — admin-only delete controls + top-5 badges + auto-create admin lists if missing
const DEBUG = true;
function log(...args){ if (DEBUG) console.log("[script.js]", ...args); }

// small safe-escape
function escapeHtml(text){
  return String(text || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

// Detect admin page: check admin IDs OR URL
const IS_ADMIN = Boolean(
  document.getElementById("adminStudentTable") ||
  document.getElementById("adminEventsList") ||
  document.getElementById("adminMaterialsList") ||
  window.location.pathname.includes("admin-dashboard")
);
log("IS_ADMIN =", IS_ADMIN);

// ensure default admin password (first time)
if (!localStorage.getItem("adminPassword")) {
  localStorage.setItem("adminPassword", "1176");
  log("Default adminPassword set.");
}

// Ensure admin list containers exist (create them if user forgot to add in HTML)
function ensureAdminContainers() {
  // Events: if admin page and adminEventsList missing but eventText input exists -> create list
  const evList = document.getElementById("adminEventsList");
  const evInput = document.getElementById("eventText");
  if (IS_ADMIN && !evList && evInput) {
    const ul = document.createElement("ul");
    ul.id = "adminEventsList";
    evInput.insertAdjacentElement("afterend", ul);
    log("Created missing #adminEventsList after #eventText");
  }

  // Materials: same idea
  const matList = document.getElementById("adminMaterialsList");
  const matInput = document.getElementById("materialText");
  if (IS_ADMIN && !matList && matInput) {
    const ul = document.createElement("ul");
    ul.id = "adminMaterialsList";
    matInput.insertAdjacentElement("afterend", ul);
    log("Created missing #adminMaterialsList after #materialText");
  }

  // Admin student table: ensure it has a tbody
  const adminTable = document.getElementById("adminStudentTable");
  if (adminTable && !adminTable.querySelector("tbody")) {
    const tbody = document.createElement("tbody");
    adminTable.appendChild(tbody);
    log("Added missing tbody to #adminStudentTable");
  }

  // Public leaderboard tbody ensure
  const leader = document.getElementById("leaderboardTable");
  if (leader && !leader.querySelector("tbody")) {
    const tbody = document.createElement("tbody");
    leader.appendChild(tbody);
    log("Added missing tbody to #leaderboardTable");
  }
}

// ---------------- Students ----------------
function addStudent(){
  if (!IS_ADMIN) { log("addStudent blocked (not admin)"); return; }
  const name = (document.getElementById("studentName")?.value || "").trim();
  const roll = (document.getElementById("studentRoll")?.value || "").trim();
  const branch = (document.getElementById("studentBranch")?.value || "").trim();
  const year = (document.getElementById("studentYear")?.value || "").trim();
  const sem = (document.getElementById("studentSem")?.value || "").trim();
  const sgpa = (document.getElementById("studentSGPA")?.value || "").trim();
  const cgpa = (document.getElementById("studentCGPA")?.value || "").trim();
  if (!name || !roll) { alert("Please enter Name and Roll"); return; }
  const s = { id: Date.now(), name, roll, branch, year, sem, sgpa, cgpa };
  const students = JSON.parse(localStorage.getItem("students")) || [];
  students.push(s);
  localStorage.setItem("students", JSON.stringify(students));
  ["studentName","studentRoll","studentBranch","studentYear","studentSem","studentSGPA","studentCGPA"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  log("Added student:", s);
  displayStudents();
}

function getBadgeForRank(i){
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  if (i === 3 || i === 4) return "🏅";
  return "";
}

function displayStudents(){
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const sorted = students.slice().sort((a,b) => (parseFloat(b.cgpa)||0) - (parseFloat(a.cgpa)||0));

  // public leaderboard
  const leaderboardTbody = document.querySelector("#leaderboardTable tbody");
  if (leaderboardTbody) {
    leaderboardTbody.innerHTML = "";
    sorted.forEach((s,i) => {
      const tr = document.createElement("tr");
      // rank
      const tdRank = document.createElement("td"); tdRank.textContent = i+1; tr.appendChild(tdRank);
      // name + badge
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) {
        const span = document.createElement("span");
        span.className = "student-badge";
        span.textContent = badge + " ";
        tdName.appendChild(span);
      }
      tdName.appendChild(document.createTextNode(escapeHtml(s.name)));
      tr.appendChild(tdName);
      // other columns
      ["roll","branch","year","sem","sgpa","cgpa"].forEach(key=>{
        const td = document.createElement("td");
        td.textContent = escapeHtml(s[key]);
        tr.appendChild(td);
      });
      leaderboardTbody.appendChild(tr);
    });
    log("Leaderboard rendered, count:", sorted.length);
  }

  // admin table (with delete) — only if admin present
  const adminTbody = document.querySelector("#adminStudentTable tbody");
  if (adminTbody && IS_ADMIN) {
    adminTbody.innerHTML = "";
    sorted.forEach((s,i) => {
      const tr = document.createElement("tr");
      // rank
      const tdRank = document.createElement("td"); tdRank.textContent = i+1; tr.appendChild(tdRank);
      // name + badge
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) {
        const span = document.createElement("span");
        span.className = "student-badge";
        span.textContent = badge + " ";
        tdName.appendChild(span);
      }
      tdName.appendChild(document.createTextNode(escapeHtml(s.name))); tr.appendChild(tdName);
      // other columns
      ["roll","branch","year","sem","sgpa","cgpa"].forEach(key=>{
        const td = document.createElement("td"); td.textContent = escapeHtml(s[key]); tr.appendChild(td);
      });
      // action
      const tdAction = document.createElement("td");
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "🗑 Delete";
      del.onclick = () => {
        if (!confirm("Delete this student?")) return;
        deleteStudentById(s.id);
      };
      tdAction.appendChild(del);
      tr.appendChild(tdAction);
      adminTbody.appendChild(tr);
    });
    log("Admin student table rendered, count:", sorted.length);
  }
}

function deleteStudentById(id){
  if (!IS_ADMIN) { log("deleteStudentById blocked"); return; }
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.filter(s => s.id !== id);
  localStorage.setItem("students", JSON.stringify(students));
  log("Deleted student id:", id);
  displayStudents();
}

// ---------------- Events ----------------
function addEvent(){
  if (!IS_ADMIN) { log("addEvent blocked (not admin)"); return; }
  const text = (document.getElementById("eventText")?.value || "").trim();
  if (!text) { alert("Enter event text"); return; }
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const e = { id: Date.now(), text };
  events.push(e);
  localStorage.setItem("events", JSON.stringify(events));
  log("Added event:", e);
  document.getElementById("eventText").value = "";
  displayEvents();
}

function displayEvents(){
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const joined = events.map(x=>x.text).join(" • ");
  document.querySelectorAll("#eventsMarquee, .eventsMarquee").forEach(el => el.innerText = joined);
  log("Marquee updated:", joined);

  // admin list with delete only if admin
  const adminEvents = document.getElementById("adminEventsList");
  if (adminEvents && IS_ADMIN) {
    adminEvents.innerHTML = "";
    events.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = ev.text + " ";
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "🗑 Delete";
      del.onclick = () => {
        if (!confirm("Delete this event?")) return;
        deleteEventById(ev.id);
      };
      li.appendChild(del);
      adminEvents.appendChild(li);
    });
    log("Admin events list rendered, count:", events.length);
  } else {
    if (adminEvents) log("adminEventsList exists but IS_ADMIN=false (won't render deletes)");
    else log("adminEventsList not present in DOM");
  }
}

function deleteEventById(id){
  if (!IS_ADMIN) { log("deleteEventById blocked"); return; }
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter(e => e.id !== id);
  localStorage.setItem("events", JSON.stringify(events));
  log("Deleted event id:", id);
  displayEvents();
}

// ---------------- Materials ----------------
function addMaterial(){
  if (!IS_ADMIN) { log("addMaterial blocked (not admin)"); return; }
  const title = (document.getElementById("materialText")?.value || "").trim();
  const link = (document.getElementById("materialLink")?.value || "").trim();
  if (!title || !link) { alert("Provide title and link"); return; }
  const materials = JSON.parse(localStorage.getItem("materials")) || [];
  const m = { id: Date.now(), title, link };
  materials.push(m);
  localStorage.setItem("materials", JSON.stringify(materials));
  log("Added material:", m);
  document.getElementById("materialText").value = "";
  document.getElementById("materialLink").value = "";
  displayMaterials();
}

function displayMaterials(){
  const materials = JSON.parse(localStorage.getItem("materials")) || [];

  // public list (no delete)
  const publicList = document.getElementById("materialsList");
  if (publicList) {
    publicList.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.textContent = m.title;
      li.appendChild(a);
      publicList.appendChild(li);
    });
    log("Public materials list rendered, count:", materials.length);
  }

  // admin list (with delete) only when IS_ADMIN
  const adminList = document.getElementById("adminMaterialsList");
  if (adminList && IS_ADMIN) {
    adminList.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.textContent = m.title;
      li.appendChild(a);
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "🗑 Delete";
      del.onclick = () => {
        if (!confirm("Delete this material?")) return;
        deleteMaterialById(m.id);
      };
      li.appendChild(del);
      adminList.appendChild(li);
    });
    log("Admin materials list rendered, count:", materials.length);
  } else {
    if (adminList) log("adminMaterialsList exists but IS_ADMIN=false (won't render deletes)");
    else log("adminMaterialsList not present in DOM");
  }
}

function deleteMaterialById(id){
  if (!IS_ADMIN) { log("deleteMaterialById blocked"); return; }
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials = materials.filter(m => m.id !== id);
  localStorage.setItem("materials", JSON.stringify(materials));
  log("Deleted material id:", id);
  displayMaterials();
}

// Password change (admin only)
function changePassword(){
  if (!IS_ADMIN) { log("changePassword blocked"); return; }
  const oldPass = (document.getElementById("oldPassword")?.value || "").trim();
  const newPass = (document.getElementById("newPassword")?.value || "").trim();
  const stored = localStorage.getItem("adminPassword");
  const msgEl = document.getElementById("passwordMessage");
  if (oldPass === stored) {
    localStorage.setItem("adminPassword", newPass);
    if (msgEl) msgEl.innerText = "✅ Password changed successfully";
    log("Password changed.");
  } else {
    if (msgEl) msgEl.innerText = "❌ Wrong old password";
    log("Password change failed: wrong old password");
  }
}

// Initial load
window.addEventListener("DOMContentLoaded", () => {
  log("DOM ready — ensuring admin containers and rendering data...");
  ensureAdminContainers();
  displayStudents();
  displayEvents();
  displayMaterials();
  log("Initial render done.");
});

  
