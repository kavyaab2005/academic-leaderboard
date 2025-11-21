const API = "http://localhost:5000/admin";

async function register() {
    let res = await fetch(API + "/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });

    let data = await res.json();
    document.getElementById("msg").innerHTML = data.message;

    if (data.success) {
        setTimeout(() => location.href = "admin-login.html", 1000);
    }
}

async function login() {
    let res = await fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });

    let data = await res.json();
    document.getElementById("msg").innerHTML = data.message;

    if (data.success) {
        localStorage.setItem("token", data.token);
        location.href = "dashboard.html";
    }
}
