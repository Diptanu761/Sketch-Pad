const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
undoBtn = document.querySelector("#undo"),
redoBtn = document.querySelector("#redo"),
ctx = canvas.getContext("2d");

// gloobal variables with default value
let prevMouseX, prevMouseY, snapshot,
isDrawing = false;
selectedTool = "brush",
brushWidth = 5;
selectedColor = "#000";
undoStack = [];
redoStack = [];

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // setting fillStyle back to the selectedColor, it'll be the brush color
}

window.addEventListener("load", () => {
    // selecting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;w
    setCanvasBackground();
});

const drawRect = (e) => {
    // If fillColor isn't checked draw a rectangle with border else draw rectangle with background..
    if (!fillColor.checked) {
        // Creating circle according to the mouse pointer..
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY); 
    } // Upon selecting fill check-box that property starts...
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY); 
}

const drawCircle = (e) => {
    ctx.beginPath(); // Creating a new each time to draw a circle..
    // Getting radius for circle according to the mouse pointer..
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // It is creating circle according to the mouse pointer..
    fillColor.checked ? ctx.fill() : ctx.stroke(); // If fillColor is checked, then fill circle else draw border circle..
}

const drawTriangle = (e) => {
    ctx.beginPath(); // Creating a new each time to draw a circle..
    ctx.moveTo(prevMouseX, prevMouseY); // It is moving triangle to the mouse pointer...
    ctx.lineTo(e.offsetX, e.offsetY); // It is creating first line to the mouse pointer..
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // It is creating 
    ctx.closePath(); // It will lead to closing the path of a triangle , so the third line draw automatically..
    fillColor.checked ? ctx.fill() : ctx.stroke(); // If fillColor is checked, then fill triangle else draw border triangle...
}

const saveState = () => {
    undoStack.push(canvas.toDataURL()); // Store image data URL
}

const redoLastAction = () => {
    if (redoStack.length > 0) {
        let redoState = new Image();
        redoState.src = redoStack.pop(); // Get the last undone state
        redoState.onload = () => {
            undoStack.push(canvas.toDataURL()); // Save current state before redoing
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            ctx.drawImage(redoState, 0, 0); // Redraw the redo state
        };
    }
};

const undoLastAction = () => {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL()); // Save current state before undoing
        let lastState = new Image();
        lastState.src = undoStack.pop(); // Get the last saved state
        lastState.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.drawImage(lastState, 0, 0); // Redraw the last saved state
            selectedTool = ""; // Clear the selected Tool
        };
    }
};

const startDraw = (e) => {
    if (!selectedTool) {
        alert("Please select brush or any shape before drawing.");
        return;
    }
    isDrawing = true;
    prevMouseX = e.offsetX; // It is passing the current mouseX to the prevMouseX...
    prevMouseY = e.offsetY; // It is passing the current mouseY to the prevMouseY...
    ctx.beginPath(); // Creating new path to draw each time...
    ctx.lineWidth = brushWidth; // It is passing brushSize as line width..
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    // Copying canvas data and passing as snapshot value.. this avoids dragging the image...
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    saveState(); // Save the current state before starting
}

const drawing = (e) => {
    if (!isDrawing) return; // If isDrawing is false return from here..
    ctx.putImageData(snapshot, 0, 0); // It is adding copied canvas data on to this canvas..

    if (selectedTool === "brush" || selectedTool === "eraser") {
        // If selected tool is eraser than set strokeStyle to white
        // to paint white color on to the existing canvas content else set the stroke color to selected color....
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY); // It is creating line according to the mouse pointer..
        ctx.stroke();  // It is drawing/filling line with color 
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
}

const stopDraw = () => {
    isDrawing = false;
};

document.getElementById("color-picker").addEventListener("input", function() {
    document.querySelector(".colors .option:nth-child(5)::before").style.background = this.value;
});

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { // It added click event to all tool option
        // It removes active class from the previous option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); // It passes slider value as brush size..

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".colors .selected")?.classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color"); 
    });
});

const colorPicker = document.querySelector("#color-picker");
colorPicker.addEventListener("input", (e) => {
    let selectedColor = e.target.value;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    colorBtns[4].style.background = selectedColor; // Change last color option dynamically...
});

colorPicker.addEventListener("change", () => {
    //It passes picked color value from color picker to last color btn background...
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // It will destroy your whole canvas i.e Clear canvas....
    setCanvasBackground();
});

saveImg.addEventListener("click", () => {
    const link = document.createElement("a"); // create <a> element
    link.download = `${Date.now()}.jpg`; // passing current date as link download value
    link.href = canvas.toDataURL(); // passing canvasData as link href value
    link.click(); // clicking link to download image
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
undoBtn.addEventListener("click", undoLastAction);
redoBtn.addEventListener("click", redoLastAction);