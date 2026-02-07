async function scanURL() {
    const rawInput = document.getElementById('urlInput').value;
    const resultBox = document.getElementById('resultBox');

    if (!rawInput.trim()) return alert("Please enter at least one URL!");

    // Split input by new line OR comma
    const urls = rawInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0);

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = "<p style='text-align:center;'>🔍 Running PhishGuard Analysis Engine...</p>";

    let combinedResults = "";

    for (const url of urls) {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });
            const data = await response.json();
            combinedResults += buildResultHTML(url, data);
        } catch (error) {
            combinedResults += `
                <div style="background:#fff3cd; border:1px solid #ffeeba; color:#856404; padding:15px; margin-bottom:10px; border-radius:8px;">
                    <strong>Error:</strong> Could not connect to the backend for URL: ${url}
                </div>`;
        }
    }
    resultBox.innerHTML = combinedResults;
}

function buildResultHTML(url, data) {
    const isMalicious = data.label === 1;
    const bgColor = isMalicious ? "#f8d7da" : "#d4edda";
    const borderColor = isMalicious ? "#f5c6cb" : "#c3e6cb";
    const textColor = isMalicious ? "#721c24" : "#155724";
    
    // Reasoning Analysis
    let reasons = [];
    const f = data.features;
    if (isMalicious) {
        if (f.url_length > 50) reasons.push("• <strong>Length:</strong> Exceptionally long URL, often used to hide the true destination.");
        if (f.has_https === 0) reasons.push("• <strong>Protocol:</strong> Insecure connection detected (No HTTPS).");
        if (f.entropy > 4.2) reasons.push("• <strong>Entropy:</strong> High character randomness detected, typical of generated malicious links.");
        if (f.keyword_count > 0) reasons.push("• <strong>Keywords:</strong> Contains high-risk words (login/verify/update).");
    } else {
        reasons.push("• <strong>Structure:</strong> Standard URL length and complexity.");
        if (f.has_https === 1) reasons.push("• <strong>Protocol:</strong> Secure HTTPS connection verified.");
        if (f.external_links >= 100) reasons.push("• <strong>Trust:</strong> High external connectivity score matching safe patterns.");
    }

    return `
        <div style="background:${bgColor}; border:1px solid ${borderColor}; color:${textColor}; padding:20px; margin-bottom:15px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-weight:bold; word-break:break-all; flex:1; margin-right:10px;">${url}</span>
                <span style="padding:4px 10px; border-radius:20px; font-size:0.8em; background:rgba(255,255,255,0.5);">
                    ${data.probability}% Confidence
                </span>
            </div>
            <div style="font-size:1.1em; font-weight:bold; margin-bottom:10px;">
                ${isMalicious ? "⚠️ VERDICT: MALICIOUS (WRONG)" : "✅ VERDICT: SAFE (RIGHT)"}
            </div>
            <div style="font-size:0.9em; line-height:1.5;">
                <strong style="text-decoration:underline;">System Reasoning:</strong><br>
                ${reasons.join('<br>')}
            </div>
        </div>
    `;
}