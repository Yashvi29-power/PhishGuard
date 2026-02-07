let dataset = [];

// Load dataset from JSON file
fetch("../data/final_dataset.json")
  .then(res => res.json())
  .then(data => {
    dataset = data;
    console.log("Dataset loaded successfully", dataset);
  })
  .catch(err => {
    console.error("Error loading dataset:", err);
  });

function scanURL() {
  const urlInput = document.getElementById("urlInput").value.trim();
  const resultBox = document.getElementById("resultBox");

  if (!urlInput) {
    resultBox.classList.remove("hidden");
    resultBox.innerText = "Please enter a URL to scan.";
    return;
  }

  // Example scan logic using dataset
  let found = dataset.find(item => item.url === urlInput);

  if (found && found.label === "phishing") {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<span style="color:red;">⚠️ Phishing Detected</span>`;
  } else {
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<span style="color:green;">✔️ URL appears safe</span>`;
  }
}
