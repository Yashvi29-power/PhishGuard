/*****************************************
 * PhishGuard – Multi-URL Scanner
 * Matches existing index.html exactly
 *****************************************/

function scanURL() {
    const inputEl = document.getElementById("urlInput");
    const resultBox = document.getElementById("resultBox");

    const rawInput = inputEl.value.trim();
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = "";

    if (!rawInput) {
        resultBox.innerHTML = "<p style='color:red'>Please enter at least one URL.</p>";
        return;
    }

    // Split by newline OR comma (stack input)
    const urls = rawInput
        .split(/\n|,/)
        .map(u => u.trim())
        .filter(u => u.length > 0);

    urls.forEach(url => {
        const analysis = analyzeURL(url);
        renderResult(analysis);
    });
}

/* ==============================
   CORE ANALYSIS LOGIC
============================== */
function analyzeURL(url) {
    let score = 0;
    let reasons = [];

    const lower = url.toLowerCase();

    // 1. IP-based URL
    if (/https?:\/\/\d+\.\d+\.\d+\.\d+/.test(lower)) {
        score += 35;
        reasons.push("Uses IP address instead of domain");
    }

    // 2. Suspicious keywords
    const keywords = [
        "login", "verify", "secure", "account",
        "update", "bank", "password", "confirm",
        "alert", "signin", "free", "gift"
    ];

    keywords.forEach(word => {
        if (lower.includes(word)) {
            score += 5;
            reasons.push(`Suspicious keyword: "${word}"`);
        }
    });

    // 3. URL length
    if (url.length > 80) {
        score += 15;
        reasons.push("Unusually long URL");
    }

    // 4. @ symbol abuse
    if (url.includes("@")) {
        score += 25;
        reasons.push("Uses '@' symbol to mislead users");
    }

    // 5. Excessive subdomains
    const dotCount = (url.match(/\./g) || []).length;
    if (dotCount > 4) {
        score += 15;
        reasons.push("Excessive number of subdomains");
    }

    // 6. HTTPS abuse
    if (lower.startsWith("https://") && score >= 20) {
        score += 5;
        reasons.push("HTTPS used to falsely imply trust");
    }

    // Final decision
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

    return { url, score, severity, status, reasons };
}

/* ==============================
   RESULT RENDERING
============================== */
function renderResult(res) {
    const resultBox = document.getElementById("resultBox");

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
            : "<p>No suspicious indicators detected.</p>"
        }
    `;

    resultBox.appendChild(card);
}
