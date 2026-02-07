function register() {
    const email = email.value;
    const password = password.value;

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) {
        showError("Password too weak");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (users[email]) {
        showError("User already exists");
        return;
    }

    users[email] = password;
    localStorage.setItem("users", JSON.stringify(users));
    window.location.href = "login.html";
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users") || "{}");

    if (users[email] !== password) {
        showError("Invalid email or password");
        return;
    }

    localStorage.setItem("session", email);
    window.location.href = "index.html";
}

function showError(msg) {
    const e = document.getElementById("error");
    e.innerText = msg;
    e.classList.remove("hidden");
}
