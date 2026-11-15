
const textInput = document.getElementById("textInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const charCount = document.getElementById("charCount");

const result = document.getElementById("result");
const errorBox = document.getElementById("errorBox");

const languageResult = document.getElementById("languageResult");
const confidenceValue = document.getElementById("confidenceValue");
const confidenceBar = document.getElementById("confidenceBar");
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");

textInput.addEventListener("input", () => {
    charCount.textContent = `${textInput.value.length} / 5000`;
});

analyzeBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    errorBox.classList.add("hidden");
    result.classList.add("hidden");

    if (!text) {
        errorBox.textContent = "Please enter some text.";
        errorBox.classList.remove("hidden");
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Prediction failed.");
        }

        if (data.language === "Uncertain") {
            languageResult.textContent =
                `Uncertain — suggestion: ${data.suggestion}`;
        } else {
            languageResult.textContent = data.language;
        }

        confidenceValue.textContent = `${data.confidence}%`;
        confidenceBar.style.width =
            `${Math.max(0, Math.min(100, data.confidence))}%`;

        statusBadge.textContent = data.status;
        statusText.textContent = data.status;

        result.classList.remove("hidden");

    } catch (error) {
        errorBox.textContent =
            error.message || "Could not connect to the server.";
        errorBox.classList.remove("hidden");

    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = 'Analyze text <span>→</span>';
    }
});

