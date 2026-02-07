async function scanURL() {
    const urlInput = document.getElementById('urlInput').value;
    const resultBox = document.getElementById('resultBox');

    if (!urlInput) {
        alert("Enter a URL first!");
        return;
    }

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = "Analyzing URL patterns...";
    resultBox.style.color = "black";
    resultBox.style.backgroundColor = "#f0f0f0";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput })
        });

        const data = await response.json();

        if (data.label === 0) {
            resultBox.innerHTML = `<h3>✅ Result: SAFE</h3><p>Confidence: ${data.probability}%</p>`;
            resultBox.style.backgroundColor = "#d4edda";
            resultBox.style.color = "#155724";
        } else {
            resultBox.innerHTML = `<h3>⚠️ Result: MALICIOUS</h3><p>This URL matches phishing patterns.</p>`;
            resultBox.style.backgroundColor = "#f8d7da";
            resultBox.style.color = "#721c24";
        }
    } catch (error) {
        resultBox.innerHTML = "Error: Backend server is not running.";
    }
}