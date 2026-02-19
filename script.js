let steps = [];
let tutorialStarted = false;

function startTutorial() {
    tutorialStarted = true;
    alert("Tutorial started! Press SPACE or ENTER to add steps.");
}

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
        video: document.getElementById("ytLink").value,
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
