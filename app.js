/*********************************
 * PHISHGUARD – URL DETECTION LOGIC
 * UI REMAINS UNTOUCHED
 *********************************/

let phishingSet = new Set();
let legitSet = new Set();

/* =========================
   LOAD DATASETS
========================= */
async function loadCSV(path, targetSet) {
    const response = await fetch(path);
    const text = await response.text();

    text.split("\n").forEach(line => {
        const value = line.trim().toLowerCase();
        if (value) targetSet.add(value);
    });
}

Promise.all([
    loadCSV("data/phishing_urls.csv", phishingSet),
    loadCSV("data/legitimate_urls.csv", legitSet)
]);

/* =========================
   HELPERS
========================= */
function extractDomain(url) {
    try {
        let domain = new URL(url).hostname.toLowerCase();
        if (domain.startsWith("www.")) domain = domain.slice(4);
        return domain;
    } catch {
        return null;
    }
}

function isIPAddress(domain) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
}

/* =========================
   MAIN SCAN FUNCTION
   (HOOK THIS TO EXISTING BUTTON)
========================= */
function scanURL() {
    const input = document.getElementById("urlInput").value.trim();
    const resultBox = document.getElementById("result");

    if (!input) return;

    const domain = extractDomain(input);

    if (!domain) {
        resultBox.innerText = "Invalid URL format.";
        return;
    }

    let score = 0;
    let verdict = "SAFE";

    /* ===== Dataset Check ===== */
    if (phishingSet.has(domain)) score += 80;
    if (legitSet.has(domain)) score -= 40;

    /* ===== Heuristics ===== */
    if (/login|verify|secure|account|update|bank/i.test(input)) score += 10;
    if (isIPAddress(domain)) score += 15;
    if (domain.split(".").length > 4) score += 10;
    if (input.length > 75) score += 10;

    /* ===== Final Verdict ===== */
    if (score >= 40) verdict = "MALICIOUS";

    /* ===== UI OUTPUT (NO STRUCTURE CHANGE) ===== */
    if (verdict === "MALICIOUS") {
        resultBox.innerHTML = `🚨 <strong>MALICIOUS</strong> (Risk Score: ${score}/100)`;
        resultBox.style.color = "red";
    } else {
        resultBox.innerHTML = `✅ <strong>SAFE</strong> (Risk Score: ${score}/100)`;
        resultBox.style.color = "green";
    }
}
