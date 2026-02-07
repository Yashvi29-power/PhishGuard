document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    const input = document.getElementById("urlInput");
    const resultBox = document.getElementById("result");

    scanBtn.addEventListener("click", () => {
        const rawInput = input.value.trim();

        if (!rawInput) {
            showMessage("Please enter one or more URLs.", "neutral");
            return;
        }

        const urls = rawInput
            .split(/\n|,/)
            .map(u => u.trim())
            .filter(u => u.length > 0);

        const analysisResults = urls.map(analyzeURL);

        renderResults(analysisResults);
    });
});

// =======================================
// CORE URL ANALYSIS
// =======================================
function analyzeURL(url) {
    let score = 0;
    let reasons = [];

    const lower = url.toLowerCase();

    // IP-based URL
    if (/https?:\/\/\d+\.\d+\.\d+\.\d+/.test(lower)) {
        score += 35;
        reasons.push("Uses raw IP address instead of domain");
    }

    // Suspicious keywords
    const keywords = [
        "login", "verify", "secure", "account", "update",
        "password", "confirm", "bank", "alert", "free",
        "gift", "win", "bonus", "signin"
    ];

    keywords.forEach(word => {
        if (lower.includes(word)) {
            score += 5;
            reasons.push(`Suspicious keyword detected: "${word}"`);
        }
    });

    // URL length
    if (url.length > 80) {
        score += 15;
        reasons.push("Unusually long URL (obfuscation technique)");
    }

    // @ symbol abuse
    if (url.includes("@")) {
        score += 25;
        reasons.push("Uses '@' symbol to mislead browsers");
    }

    // Too many subdomains
    const dots = (url.match(/\./g) || []).length;
    if (dots > 4) {
        score += 15;
        reasons.push("Excessive subdomains (phishing pattern)");
    }

    // HTTPS abuse
    if (lower.startsWith("https://") && score >= 20) {
        score += 5;
        reasons.push("HTTPS used to falsely imply trust");
    }

    // ===============================
    // SEVERITY DECISION
    // ===============================
    let severity = "LOW";
    let status = "SAFE";

    if (score >= 60) {
        severity = "CRITICAL";
        status = "MALICIOUS";
    } else if (score >= 40) {
        severity = "HIGH";
        status = "MALICIOUS";
    } else if (score >= 25) {
        severity = "MEDIUM";
        status = "SUSPICIOUS";
    }

    return {
        url,
        score,
        severity,
        status,
        reasons
    };
}

// =======================================
// RESULT RENDERING (GRAMMARLY STYLE)
// =======================================
function renderResults(results) {
    const resultBox = document.getElementById("result");
    resultBox.innerHTML = "";

    results.forEach(res => {
        const color =
            res.status === "MALICIOUS" ? "#ff3131" :
                res.status === "SUSPICIOUS" ? "#facc15" :
                    "#39ff14";

        const card = document.createElement("div");
        card.style.borderLeft = `4px solid ${color}`;
        card.style.padding = "12px";
        card.style.marginBottom = "14px";
        card.style.background = "#020617";

        card.innerHTML = `
            <strong style="color:${color}">${res.status}</strong>
            <p><code>${res.url}</code></p>
            <p><b>Severity:</b> ${res.severity}</p>
            <p><b>Risk Score:</b> ${res.score}/100</p>
            ${res.reasons.length
                ? `<ul>${res.reasons.map(r => `<li>${r}</li>`).join("")}</ul>`
                : "<p>No suspicious indicators found.</p>"
            }
        `;

        resultBox.appendChild(card);
    });
}

// =======================================
// SIMPLE MESSAGE
// =======================================
function showMessage(msg, type) {
    const resultBox = document.getElementById("result");
    resultBox.innerHTML = `<p>${msg}</p>`;
}
