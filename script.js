let steps = [];
let tutorialStarted = false;

// ===============================
// MANUAL TUTORIAL BUILDER
// ===============================


function addStep() {
    if (!tutorialStarted) return;
    let timestamp = prompt("Enter timestamp (e.g., 42 for 42 seconds):");
    if (timestamp === null || timestamp.trim() === "") return;
    let step = { timestamp: timestamp.trim(), text: "" };
    steps.push(step);
    renderSteps();
}

function renderSteps() {
    let container = document.getElementById("steps");
    if (!container) return;

    container.innerHTML = "";

    steps.forEach((step, index) => {
        let div = document.createElement("div");
        div.className = "step";

        div.innerHTML = `
            <strong>Step ${index + 1}</strong><br>
            Timestamp: ${step.timestamp}s<br><br>
            <textarea placeholder="Step text..." 
                      oninput="steps[${index}].text = this.value">${step.text}</textarea>
            <div class="step-controls">
                <button onclick="moveUp(${index})">↑</button>
                <button onclick="moveDown(${index})">↓</button>
                <button onclick="deleteStep(${index})">Delete</button>
            </div>
        `;

        container.appendChild(div);
    });
}

function moveUp(i) {
    if (i === 0) return;
    [steps[i], steps[i - 1]] = [steps[i - 1], steps[i]];
    renderSteps();
}

function moveDown(i) {
    if (i === steps.length - 1) return;
    [steps[i], steps[i + 1]] = [steps[i + 1], steps[i]];
    renderSteps();
}

function deleteStep(i) {
    steps.splice(i, 1);
    renderSteps();
}

function exportJSON() {
    let data = {
        video: document.getElementById("ytLink")?.value || "",
        steps: steps
    };
    let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "tutorial.json";
    a.click();
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        addStep();
    }
});

// ===============================
// AUTO-GENERATE TUTORIAL (OpenRouter)
// ===============================

// Extract video ID from YouTube URL
function extractVideoID(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

// Fetch transcript from free API
async function fetchTranscript(videoId) {
    const res = await fetch(`https://youtubetranscript.com/?video_id=${videoId}`);
    if (!res.ok) throw new Error("Transcript not available");
    const data = await res.json();
    return data.map(x => x.text).join(" ");
}

// Convert transcript to readable text (optional)
function transcriptToText(text) {
    return text;
}

// ===============================
// ONE-LINE OpenRouter + safeJSON
// ===============================

async function callOpenRouter(prompt){const apiKey="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";const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:"mistralai/mistral-7b-instruct",messages:[{role:"system",content:"You extract clean tutorial steps from transcripts. Always return valid JSON."},{role:"user",content:prompt}]})});const d=await r.json();return d.choices[0].message.content;}

function safeJSON(text) { try { return JSON.parse(text); } catch { const match = text.match(PLACEHOLDER_REGEX); return match ? JSON.parse(match[0]) : null; } }

// ===============================
// LOAD AI STEPS INTO MANUAL UI
// ===============================

function loadAIGeneratedSteps(aiSteps) {
    steps = aiSteps.map(s => ({
        timestamp: s.timestamp,
        text: s.text
    }));
    renderSteps();
}

// ===============================
// AUTO-GENERATE PIPELINE
// ===============================

async function autoGenerate() {
    const url = document.getElementById("ytLink").value;
    const videoId = extractVideoID(url);

    if (!videoId) {
        alert("Invalid YouTube URL");
        return;
    }

    try {
        const transcript = await fetchTranscript(videoId);

        const prompt = `
Extract clear tutorial steps from this transcript.
Return ONLY JSON in this format:

[
  { "timestamp": 0, "text": "Step instruction" }
]

Transcript:
${transcript}
        `;

        const aiResponse = await callOpenRouter(prompt);
        const parsed = safeJSON(aiResponse);

        if (!parsed) {
            alert("AI returned invalid JSON");
            console.log(aiResponse);
            return;
        }

        loadAIGeneratedSteps(parsed);

    } catch (err) {
        alert("Error: " + err.message);
        console.error(err);
    }
}
function startTutorial() {
    tutorialStarted = true;
    alert("Tutorial started! Press SPACE or ENTER to add steps.");
    autoGenerate(); // AI auto-runs
}
