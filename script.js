/* ----------------------------------------------------
   SIDEBAR TOGGLE (Mobile)
---------------------------------------------------- */
const sidebar = document.querySelector(".sidebar");
const menuBtn = document.querySelector(".menu-btn");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

/* ----------------------------------------------------
   SMOOTH SCROLL FOR ALL LINKS
---------------------------------------------------- */
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

/* ----------------------------------------------------
   ACTIVE LINK HIGHLIGHT
---------------------------------------------------- */
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".sidebar a").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

/* ----------------------------------------------------
   IMAGE PREVIEW (Add Photo / Add Events)
---------------------------------------------------- */
function previewImage(inputId, previewId) {
  const fileInput = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!fileInput || !preview) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };

    if (file) reader.readAsDataURL(file);
  });
}

// Activate preview for pages that use it
previewImage("photoUpload", "previewImg");
previewImage("eventImage", "previewImg");

/* ----------------------------------------------------
   CARD HOVER ELEVATION
---------------------------------------------------- */
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-5px)";
    card.style.transition = "0.3s";
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0px)";
  });
});

/* ----------------------------------------------------
   DARK MODE
---------------------------------------------------- */
const darkToggle = document.querySelector("#darkModeToggle");

if (darkToggle) {
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });

  // Load saved mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

/* ----------------------------------------------------
   BACK TO TOP BUTTON
---------------------------------------------------- */
const topBtn = document.createElement("button");
topBtn.innerText = "↑";
topBtn.id = "backToTop";
topBtn.style.position = "fixed";
topBtn.style.bottom = "25px";
topBtn.style.right = "25px";
topBtn.style.padding = "10px 16px";
topBtn.style.fontSize = "20px";
topBtn.style.display = "none";
topBtn.style.borderRadius = "50%";
topBtn.style.border = "none";
topBtn.style.background = "#4f46e5";
topBtn.style.color = "#fff";
topBtn.style.cursor = "pointer";
topBtn.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
document.body.appendChild(topBtn);

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) topBtn.style.display = "block";
  else topBtn.style.display = "none";
});

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

/* ----------------------------------------------------
   PAGE LOADING FADE-IN
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "0.7s";
    document.body.style.opacity = "1";
  }, 50);
});
