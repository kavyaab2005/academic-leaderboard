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
        const td = document.createElement("td"); td.textContent = escapeHtml(s[key]); tr.appendChild(td);
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
      const tdRank = document.createElement("td"); tdRank.textContent = i+1; tr.appendChild(tdRank);
      const tdName = document.createElement("td");
      const badge = getBadgeForRank(i);
      if (badge) {
        const span = document.createElement("span");
        span.className = "student-badge";
        span.textContent = badge + " ";
        tdName.appendChild(span);
      }
      tdName.appendChild(document.createTextNode(escapeHtml(s.name))); tr.appendChild(tdName);
      ["roll","branch","year","sem","sgpa","cgpa"].forEach(key=>{
        const td = document.createElement("td"); td.textContent = escapeHtml(s[key]); tr.appendChild(td);
      });
      const tdAction = document.createElement("td");
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "🗑 Delete";
      del.onclick = () => { if(confirm("Delete this student?")) deleteStudentById(s.id); };
      tdAction.appendChild(del);
      tr.appendChild(tdAction);
      adminTbody.appendChild(tr);
    });
    log("Admin student table rendered, count:", sorted.length);
  }
}

function deleteStudentById(id){


