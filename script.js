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

// ---------- Add Student ----------
function addStudent() {
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
    id: Date.now(), // unique id so delete works even after sorting
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

  // clear inputs (if present)
  ["studentName","studentRoll","studentBranch","studentYear","studentSem","studentSGPA","studentCGPA"]
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });

  displayStudents();
}

// ---------- Display Students (both leaderboard and admin table) ----------
function displayStudents() {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  // sort copy by numeric CGPA descending (coerce to number safely)
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
        <td><button onclick="deleteStudentById(${s.id})">Delete</button></td>
      </tr>`;
      adminTbody.insertAdjacentHTML("beforeend", row);
    });
  }
}

// ---------- Delete student by unique id ----------
function deleteStudentById(id) {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return;
  if (!confirm("Delete this student?")) return;
  students.splice(idx, 1);
  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
}

// ---------- Events ----------
function addEvent() {
  const text = (document.getElementById("eventText")?.value || "").trim();
  if (!text) return;
  const events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({ id: Date.now(), text });
  localStorage.setItem("events", JSON.stringify(events));
  const el = document.getElementById("eventText"); if (el) el.value = "";
  displayEvents();
}
function displayEvents() {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const joined = events.map(e => e.text || e).join(" • ");
  // update multiple possible selectors so both admin & dashboard get updated
  document.querySelectorAll("#eventsMarquee, .eventsMarquee, #events, .events").forEach(el => {
    el.innerText = joined;
  });
}

// (Optional) delete event function for admin
function deleteEventById(id) {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return;
  if (!confirm("Delete this event?")) return;
  events.splice(idx,1);
  localStorage.setItem("events", JSON.stringify(events));
  displayEvents();
}

// ---------- Study Materials ----------
function addMaterial() {
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
  // update multiple possible list containers
  document.querySelectorAll("#materialsList, .materialsList, #studyMaterials, .study-materials").forEach(list => {
    if (!list) return;
    list.innerHTML = "";
    materials.forEach(m => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = m.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = m.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  });
}

// ---------- Change Password ----------
function changePassword() {
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

// ---------- Auto-load on pages ----------
window.onload = () => {
  displayStudents();
  displayEvents();
  displayMaterials();
};



