
const canvas = new fabric.Canvas("canvas", {
    isDrawingMode: false,
    backgroundColor: "white",
    // make canvas 100% of the canvas-editor div
    width: document.getElementById("canvas-editor").clientWidth,
    height: document.getElementById("canvas-editor").clientHeight,

    selection: true,
    selectionBorderColor: "blue",
    selectionLineWidth: 2,
    selectionDashArray: [5, 5],
    selectionColor: "rgba(0, 0, 0, 0.3)",
    selectionFullyContained: true,
    preserveObjectStacking: true,
    freeDrawingBrush: {
        width: 5,
        color: "black",
    },
});

const resizeevent = () => {
    canvas.setWidth(document.getElementById("canvas-editor").clientWidth);
    canvas.setHeight(document.getElementById("canvas-editor").clientHeight);
    console.log(document.getElementById("canvas-editor").clientWidth);
    console.log(document.getElementById("canvas-editor").clientHeight);
    console.log("canvas resized");
}

// create onchange when canvas-container is resized then resize canvas to fit
window.addEventListener("resize", () => {
    resizeevent();
});

new ResizeObserver(() => {
    resizeevent();
}).observe(document.getElementById("canvas-editor"));


const RectBtn = document.getElementById("canvas-editor-toolbar-rect");
const selectBtn = document.getElementById("canvas-editor-toolbar-select");

var isRectMode = false;


// with RectBtn allow the user to draw rectangle with the mouse
RectBtn.addEventListener("click", () => {
    // set color of the button 
    RectBtn.style.backgroundColor = "rgb(61, 48, 48)";
    selectBtn.style.backgroundColor = "#111";

    



    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = "default";
    canvas.on("mouse:down", (e) => {
        if (e.target) {
            return;
        }
        const rect = new fabric.Rect({
            left: e.pointer.x,
            top: e.pointer.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: "black",
            strokeWidth: 1,
            selectable: true,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.on("mouse:move", (e) => {
            if (e.target) {
                return;
            }
            rect.set({
                width: e.pointer.x - rect.left,
                height: e.pointer.y - rect.top,
            });
            canvas.renderAll();
        });
    });
    canvas.on("mouse:up", () => {
        canvas.off("mouse:move");
    });
});


// with the delete key if objects selected delete them
document.addEventListener("keydown", (e) => {
    if (e.key === "Delete") {
        canvas.getActiveObjects().forEach((obj) => {
            canvas.remove(obj);
        });
    }
});


selectBtn.style.backgroundColor = "rgb(61, 48, 48)";
// with selectBtn allow the user to select objects with the mouse
selectBtn.addEventListener("click", () => {
    canvas.isDrawingMode = false;
    // set drawing mode to false
    selectBtn.style.backgroundColor = "rgb(61, 48, 48)";
    RectBtn.style.backgroundColor = "#111";
    canvas.selection = true;
    canvas.defaultCursor = "default";
    // set selectBtn color to rgb(61, 48, 48)
    console.log("selectBtn clicked");
    //disable drawing of rectangles
    canvas.off("mouse:down");
});

var states = [];
const undo = document.getElementById("canvas-editor-toolbar-undo");
// with undoBtn allow the user to undo the last action
undo.addEventListener("click", () => {
    var lastItemIndex = canvas.getObjects().length - 1;
    var item = canvas.item(lastItemIndex);
    // add the object to the states array
    states.push(item);
    canvas.remove(item);
    canvas.renderAll();
});

const redo = document.getElementById("canvas-editor-toolbar-redo");



// when new object is added to canvas add it to states array
canvas.on("object:added", (e) => {
    states.push(e.target);
});

// with redoBtn allow the user to redo the last action
redo.addEventListener("click", () => {
    var lastItemIndex = states.length - 1;
    var item = states[lastItemIndex];

    // add the object to the canvas if object exists in canvas do not render
    if (item) {
        canvas.add(item);
        canvas.renderAll();
        states.pop();
    }
});    