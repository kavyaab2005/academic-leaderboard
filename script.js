// script.js
// Admin-only add/delete enforcement + top-5 badges
// -------------------------------------------------

// ---------- helper ----------
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------- detect "admin" page ----------
const IS_ADMIN = Boolean(
  document.getElementById("adminStudentTable") ||
  document.getElementById("adminMaterialsList") ||
  document.getElementById("adminEventsList") ||
  window.location.pathname.includes("admin-dashboard.html")
);

// ---------- default admin password ----------
if (!localStorage.getItem("adminPassword")) {
  localStorage.setItem("adminPassword", "1176");
}

// ---------- Admin Login ----------
function adminLogin() {
  const passEl = document.getElementById("adminPassword");
  const pass = passEl ? passEl.value.trim() : "";
  const storedPass = localStorage.getItem("adminPassword");
  if (pass === storedPass) {
    window.location.href = "admin-dashboard.html";
  } else {
    const msg = document.getElementById("loginMessage");
    if (msg) msg.innerText = "❌ Incorrect password";
  }
}

// ==================================================
// STUDENT MANAGEMENT (admin-only add/delete; public view read-only)
// ==================================================
function addStudent() {
  if (!IS_ADMIN) return; // Prevent adding from public pages

  const name = (document.getElementById("studentName")?.value || "").trim();
  const roll = (document.getElementById("studentRoll")?.value || "").trim();
  const branch = (document.getElementById("studentBranch")?.value || "").trim();
  const year = (document.getElementById("studentYear")?.value || "").trim();
  const sem = (document.getElementById("studentSem")?.value || "").trim();
  const sgpa = (document.getElementById("studentSGPA")?.value || "").trim();
  const cgpa = (document.getElementById("studentCGPA")?.value || "").trim();

  if (!name || !roll) {
    alert("Please enter at least Name and Roll.");
    return;
  }

  const student = {
    id: Date.now(),
    name,
    roll,
    branch,
    year,
    sem,
    sgpa,
    cgpa
  };

  const students = JSON.parse(localStorage.getItem("students")) || [];
  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));

  ["studentName","studentRoll","studentBranch","studentYear","studentSem","studentSGPA","studentCGPA"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

  displayStudents();
}

function getBadgeForRank(rankZeroBased) {
  // 0 => first place
  switch(rankZeroBased) {
    case 0: return "🥇"; // gold
    case 1: return "🥈"; // silver
    case 2: return "🥉"; // bronze
    case 3: return "🏅";
    case 4: return "🏅";
    default: return "";
  }
}

function displayStudents() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  // sort copy by numeric CGPA descending (coerce floats)
  const sorted = students.slice().sort((a,b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0));

  // ---------------- public leaderboard ----------------
  const leaderboardTbody = document.querySelector("#leaderboardTable tbody");
  if (leaderboardTbody) {
    leaderboardTbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const tr = document.createElement("tr");

      // Rank cell
      const tdRank = document.createElement("td");
      tdRank.textContent = String(i + 1);
      tr.appendChild(tdRank);

      // Name cell (with badge for top-5)
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) {
        const spanBadge = document.createElement("span");
        spanBadge.className = "student-badge";
        spanBadge.setAttribute("title", i < 3 ? "Top " + (i+1) : "Top 5");
        spanBadge.textContent = badge + " ";
        tdName.appendChild(spanBadge);
      }
      tdName.appendChild(document.createTextNode(escapeHtml(s.name)));
      tr.appendChild(tdName);

      // Other columns
      ["roll","branch","year","sem","sgpa","cgpa"].forEach(key => {
        const td = document.createElement("td");
        td.textContent = escapeHtml(s[key]);
        tr.appendChild(td);
      });

      leaderboardTbody.appendChild(tr);
    });
  }

  // ---------------- admin table (with delete) ----------------
  const adminTbody = document.querySelector("#adminStudentTable tbody");
  if (adminTbody && IS_ADMIN) {
    adminTbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const tr = document.createElement("tr");

      // Rank
      const tdRank = document.createElement("td");
      tdRank.textContent = String(i + 1);
      tr.appendChild(tdRank);

      // Name with same badge (admin view also shows badges)
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) {
        const spanBadge = document.createElement("span");
        spanBadge.className = "student-badge";
        spanBadge.setAttribute("title", i < 3 ? "Top " + (i+1) : "Top 5");
        spanBadge.textContent = badge + " ";
        tdName.appendChild(spanBadge);
      }
      tdName.appendChild(document.createTextNode(escapeHtml(s.name)));
      tr.appendChild(tdName);

      // Other student columns
      ["roll","branch","year","sem","sgpa","cgpa"].forEach(key => {
        const td = document.createElement("td");
        td.textContent = escapeHtml(s[key]);
        tr.appendChild(td);
      });

      // Action (delete) - only in admin
      const tdAction = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "🗑 Delete";
      delBtn.onclick = () => {
        if (!confirm("Delete this student?")) return;
        deleteStudentById(s.id);
      };
      tdAction.appendChild(delBtn);
      tr.appendChild(tdAction);

      adminTbody.appendChild(tr);
    });
  }
}

function deleteStudentById(id) {
  if (!IS_ADMIN) return;
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.filter(s => s.id !== id);
  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
}

// ==================================================
// EVENT MANAGEMENT
// ==================================================
function addEvent() {
  if (!IS_ADMIN) return; // only admin can add
  const text = (document.getElementById("eventText")?.value || "").trim();
  if (!text) return;
  const events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({ id: Date.now(), text });
  localStorage.setItem("events", JSON.stringify(events));
  const input = document.getElementById("eventText");
  if (input) input.value = "";
  displayEvents();
}

function displayEvents() {
  const events = JSON.parse(localStorage.getItem("events")) || [];

  // Public marquee (no delete buttons)
  const joined = events.map(e => e.text).join(" • ");
  document.querySelectorAll("#eventsMarquee, .eventsMarquee").forEach(el => {
    el.innerText = joined;
  });

  // Admin events list (with delete)
  const adminEvents = document.getElementById("adminEventsList");
  if (adminEvents && IS_ADMIN) {
    adminEvents.innerHTML = "";
    events.forEach(e => {
      const li = document.createElement("li");
      const txt = document.createElement("span");
      txt.textContent = e.text + " ";
      li.appendChild(txt);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "🗑 Delete";
      delBtn.onclick = () => {
        if (!confirm("Delete this event?")) return;
        deleteEventById(e.id);
      };
      li.appendChild(delBtn);
      adminEvents.appendChild(li);
    });
  }
}

function deleteEventById(id) {
  if (!IS_ADMIN) return;
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter(e => e.id !== id);
  localStorage.setItem("events", JSON.stringify(events));
  displayEvents();
}

// ==================================================
// STUDY MATERIALS MANAGEMENT
// ==================================================
function addMaterial() {
  if (!IS_ADMIN) return; // only admin can add
  const title = (document.getElementById("materialText")?.value || "").trim();
  const link = (document.getElementById("materialLink")?.value || "").trim();
  if (!title || !link) {
    alert("Please provide both title and link.");
    return;
  }
  const materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials.push({ id: Date.now(), title, link });
  localStorage.setItem("materials", JSON.stringify(materials));

  const t = document.getElementById("materialText"); if (t) t.value = "";
  const l = document.getElementById("materialLink"); if (l) l.value = "";

  displayMaterials();
}

function displayMaterials() {
  const materials = JSON.parse(localStorage.getItem("materials")) || [];

  // Public list (no delete controls)
  const publicList = document.getElementById("materialsList");
  if (publicList) {
    publicList.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = m.title;
      li.appendChild(a);
      publicList.appendChild(li);
    });
  }

  // Admin list (with delete)
  const adminList = document.getElementById("adminMaterialsList");
  if (adminList && IS_ADMIN) {
    adminList.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = m.title;
      li.appendChild(a);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "🗑 Delete";
      delBtn.onclick = () => {
        if (!confirm("Delete this material?")) return;
        deleteMaterialById(m.id);
      };
      li.appendChild(delBtn);
      adminList.appendChild(li);
    });
  }
}

function deleteMaterialById(id) {
  if (!IS_ADMIN) return;
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials = materials.filter(m => m.id !== id);
  localStorage.setItem("materials", JSON.stringify(materials));
  displayMaterials();
}

// ==================================================
// PASSWORD CHANGE (admin only)
// ==================================================
function changePassword() {
  if (!IS_ADMIN) return;
  const oldPass = (document.getElementById("oldPassword")?.value || "").trim();
  const newPass = (document.getElementById("newPassword")?.value || "").trim();
  const storedPass = localStorage.getItem("adminPassword");
  const msgEl = document.getElementById("passwordMessage");
  if (oldPass === storedPass) {
    localStorage.setItem("adminPassword", newPass);
    if (msgEl) msgEl.innerText = "✅ Password changed successfully";
  } else {
    if (msgEl) msgEl.innerText = "❌ Wrong old password";
  }
}

// ==================================================
// AUTO LOAD
// ==================================================
window.addEventListener("DOMContentLoaded", () => {
  displayStudents();
  displayEvents();
  displayMaterials();
});
