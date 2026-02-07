function scanURL() {
    const url = document.getElementById("urlInput").value;
    const box = document.getElementById("resultBox");

    box.classList.remove("hidden");

    if (url.includes("login") || url.includes("verify")) {
        box.className = "danger";
        box.innerText = "⚠ PHISHING DETECTED\nHigh risk URL pattern found.";
    } else {
        box.className = "safe";
        box.innerText = "✔ URL APPEARS SAFE\nNo malicious indicators detected.";
    }
}
