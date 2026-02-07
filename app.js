// ================================
// PhishGuard Client-Side Scanner
// No backend • No Flask • Deployable
// ================================

document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    const urlInput = document.getElementById("urlInput");
    const resultBox = document.getElementById("result");

    scanBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();

        if (!url) {
            showResult("Please enter a URL.", "neutral");
            return;
        }

        const analysis = analyzeURL(url);
        showResult(analysis.message, analysis.status);
    });
});

// ================================
// CORE DETECTION LOGIC
// ================================
function analyzeURL(url) {
    let score = 0;
    let reasons = [];

    const lowerUrl = url.toLowerCase();

    // 1️⃣ IP address instead of domain
    if (/https?:\/\/\d+\.\d+\.\d+\.\d+/.test(lowerUrl)) {
        score += 30;
        reasons.push("Uses IP address instead of domain");
    }

    // 2️⃣ Suspicious keywords
    const keywords = [
        "login", "verify", "secure", "account", "update",
        "bank", "confirm", "password", "signin", "free",
        "gift", "bonus", "win", "alert"
    ];

    keywords.forEach(word => {
        if (lowerUrl.includes(word)) {
            score += 5;
            reasons.push(`Contains suspicious keyword: "${word}"`);
        }
    });

    // 3️⃣ URL length abuse
    if (url.length > 75) {
        score += 15;
        reasons.push("Unusually long URL");
    }

    // 4️⃣ @ symbol trick
    if (url.includes("@")) {
        score += 20;
        reasons.push("Uses '@' symbol to obscure real destination");
    }

    // 5️⃣ Multiple subdomains
    const dotCount = (url.match(/\./g) || []).length;
    if (dotCount > 4) {
        score += 10;
        reasons.push("Excessive subdomains");
    }

    // 6️⃣ HTTPS but suspicious
    if (lowerUrl.startsWith("https://") && score > 20) {
        score += 5;
        reasons.push("HTTPS used to appear trustworthy");
    }

    // ================================
    // FINAL VERDICT
    // ================================
    if (score >= 35) {
        return {
            status: "malicious",
            message: formatMessage(
                "🚨 Malicious / Phishing URL Detected",
                score,
                reasons
            )
        };
    }

    if (score >= 20) {
        return {
            status: "suspicious",
            message: formatMessage(
                "⚠️ Suspicious URL",
                score,
                reasons
            )
        };
    }

    return {
        status: "safe",
        message: formatMessage(
            "✅ URL appears safe",
            score,
            reasons
        )
    };
}

// ================================
// UI OUTPUT (NO UI CHANGE REQUIRED)
// ================================
function showResult(html, status) {
    const resultBox = document.getElementById("result");

    let color;
    if (status === "malicious") color = "#ff3131";
    else if (status === "suspicious") color = "#facc15";
    else color = "#39ff14";

    resultBox.innerHTML = html;
    resultBox.style.borderLeft = `4px solid ${color}`;
}

// ================================
// RESULT FORMATTER
// ================================
function formatMessage(title, score, reasons) {
    let html = `<h3>${title}</h3>`;
    html += `<p><strong>Risk Score:</strong> ${score}/100</p>`;

    if (reasons.length > 0) {
        html += "<ul>";
        reasons.forEach(r => {
            html += `<li>${r}</li>`;
        });
        html += "</ul>";
    }

    return html;
}
