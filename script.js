// ---------- helper ----------
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
// 🟢 STUDENT MANAGEMENT
// ==================================================
function addStudent() {
  if (!document.getElementById("adminStudentTable")) return; // only admin

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

function displayStudents() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const sorted = students.slice().sort((a,b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0));

  const leaderboardTbody = document.querySelector("#leaderboardTable tbody");
  const adminTbody = document.querySelector("#adminStudentTable tbody");

  if (leaderboardTbody) {
    leaderboardTbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const row = `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.roll)}</td>
        <td>${escapeHtml(s.branch)}</td>
        <td>${escapeHtml(s.year)}</td>
        <td>${escapeHtml(s.sem)}</td>
        <td>${escapeHtml(s.sgpa)}</td>
        <td>${escapeHtml(s.cgpa)}</td>
      </tr>`;
      leaderboardTbody.insertAdjacentHTML("beforeend", row);
    });
  }

  if (adminTbody) {
    adminTbody.innerHTML = "";
    sorted.forEach((s, i) => {
      const row = `<tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.roll)}</td>
        <td>${escapeHtml(s.branch)}</td>
        <td>${escapeHtml(s.year)}</td>
        <td>${escapeHtml(s.sem)}</td>
        <td>${escapeHtml(s.sgpa)}</td>
        <td>${escapeHtml(s.cgpa)}</td>
        <td><button onclick="deleteStudentById(${s.id})">🗑 Delete</button></td>
      </tr>`;
      adminTbody.insertAdjacentHTML("beforeend", row);
    });
  }
}

function deleteStudentById(id) {
  if (!document.getElementById("adminStudentTable")) return; // only admin
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students = students.filter(s => s.id !== id);
  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
}

// ==================================================
// 🟢 EVENT MANAGEMENT
// ==================================================
function addEvent() {
  if (!document.getElementById("adminEventsList")) return; // only admin
  const text = (document.getElementById("eventText")?.value || "").trim();
  if (!text) return;
  const events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({ id: Date.now(), text });
  localStorage.setItem("events", JSON.stringify(events));
  document.getElementById("eventText").value = "";
  displayEvents();
}

function displayEvents() {
  const events = JSON.parse(localStorage.getItem("events")) || [];

  // Dashboard display (marquee style)
  const joined = events.map(e => e.text).join(" • ");
  document.querySelectorAll("#eventsMarquee, .eventsMarquee").forEach(el => {
    el.innerText = joined;
  });

  // Admin list (with delete buttons)
  const adminEvents = document.getElementById("adminEventsList");
  if (adminEvents) {
    adminEvents.innerHTML = "";
    events.forEach(e => {
      const li = document.createElement("li");
      li.textContent = e.text + " ";
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑 Delete";
      delBtn.onclick = () => deleteEventById(e.id);
      li.appendChild(delBtn);
      adminEvents.appendChild(li);
    });
  }
}

function deleteEventById(id) {
  if (!document.getElementById("adminEventsList")) return; // only admin
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events = events.filter(e => e.id !== id);
  localStorage.setItem("events", JSON.stringify(events));
  displayEvents();
}

// ==================================================
// 🟢 STUDY MATERIAL MANAGEMENT
// ==================================================
function addMaterial() {
  if (!document.getElementById("adminMaterialsList")) return; // only admin
  const title = (document.getElementById("materialText")?.value || "").trim();
  const link = (document.getElementById("materialLink")?.value || "").trim();
  if (!title || !link) {
    alert("Please provide both title and link.");
    return;
  }
  const materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials.push({ id: Date.now(), title, link });
  localStorage.setItem("materials", JSON.stringify(materials));

  document.getElementById("materialText").value = "";
  document.getElementById("materialLink").value = "";
  displayMaterials();
}

function displayMaterials() {
  const materials = JSON.parse(localStorage.getItem("materials")) || [];

  // Public list (students)
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
  if (adminList) {
    adminList.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = m.title;
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑 Delete";
      delBtn.onclick = () => deleteMaterialById(m.id);
      li.appendChild(a);
      li.appendChild(delBtn);
      adminList.appendChild(li);
    });
  }
}

function deleteMaterialById(id) {
  if (!document.getElementById("adminMaterialsList")) return; // only admin
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials = materials.filter(m => m.id !== id);
  localStorage.setItem("materials", JSON.stringify(materials));
  displayMaterials();
}

// ==================================================
// 🟢 PASSWORD CHANGE
// ==================================================
function changePassword() {
  if (!document.getElementById("newPassword")) return; // only admin
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
// 🟢 AUTO LOAD
// ==================================================
window.onload = () => {
  displayStudents();
  displayEvents();
  displayMaterials();
};
