// Default admin password stored in localStorage
if (!localStorage.getItem("adminPassword")) {
  localStorage.setItem("adminPassword", "1176");
}

// Admin Login
function adminLogin() {
  let pass = document.getElementById("adminPassword").value;
  let storedPass = localStorage.getItem("adminPassword");
  if (pass === storedPass) {
    window.location.href = "admin-dashboard.html";
  } else {
    document.getElementById("loginMessage").innerText = "❌ Incorrect password";
  }
}

// Add Student
function addStudent() {
  let student = {
    name: document.getElementById("studentName").value,
    roll: document.getElementById("studentRoll").value,
    branch: document.getElementById("studentBranch").value,
    year: document.getElementById("studentYear").value,
    sem: document.getElementById("studentSem").value,
    sgpa: document.getElementById("studentSGPA").value,
    cgpa: document.getElementById("studentCGPA").value
  };

  let students = JSON.parse(localStorage.getItem("students")) || [];
  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
}

// Display Students
function displayStudents() {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let table = document.querySelector("#leaderboardTable tbody") || document.querySelector("#adminStudentTable tbody");
  if (!table) return;

  table.innerHTML = "";
  students.sort((a, b) => b.cgpa - a.cgpa).forEach((s, i) => {
    let row = `<tr>
      <td>${i+1}</td><td>${s.name}</td><td>${s.roll}</td>
      <td>${s.branch}</td><td>${s.year}</td><td>${s.sem}</td>
      <td>${s.sgpa}</td><td>${s.cgpa}</td>
      ${table.id === "adminStudentTable" ? `<td><button onclick="deleteStudent(${i})">Delete</button></td>` : ""}
    </tr>`;
    table.innerHTML += row;
  });
}
function deleteStudent(index) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  students.splice(index, 1);
  localStorage.setItem("students", JSON.stringify(students));
  displayStudents();
}

// Add Event
function addEvent() {
  let event = document.getElementById("eventText").value;
  let events = JSON.parse(localStorage.getItem("events")) || [];
  events.push(event);
  localStorage.setItem("events", JSON.stringify(events));
  displayEvents();
}
function displayEvents() {
  let events = JSON.parse(localStorage.getItem("events")) || [];
  let marquee = document.getElementById("eventsMarquee");
  if (marquee) marquee.innerText = events.join(" • ");
}

// Study Materials
function addMaterial() {
  let title = document.getElementById("materialText").value;
  let link = document.getElementById("materialLink").value;
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  materials.push({title, link});
  localStorage.setItem("materials", JSON.stringify(materials));
  displayMaterials();
}
function displayMaterials() {
  let materials = JSON.parse(localStorage.getItem("materials")) || [];
  let list = document.getElementById("materialsList");
  if (!list) return;
  list.innerHTML = "";
  materials.forEach(m => {
    list.innerHTML += `<li><a href="${m.link}" target="_blank">${m.title}</a></li>`;
  });
}

// Change Password
function changePassword() {
  let oldPass = document.getElementById("oldPassword").value;
  let newPass = document.getElementById("newPassword").value;
  let storedPass = localStorage.getItem("adminPassword");
  if (oldPass === storedPass) {
    localStorage.setItem("adminPassword", newPass);
    document.getElementById("passwordMessage").innerText = "✅ Password changed successfully";
  } else {
    document.getElementById("passwordMessage").innerText = "❌ Wrong old password";
  }
}

// Auto-load on pages
window.onload = () => {
  displayStudents();
  displayEvents();
  displayMaterials();
};
