let selectedElement = undefined;
let clipboard = undefined;
let shiftHeld = false;
let elements = [];
let timeline = [];
let timelinePosition = 0;
let outputTypes = [
    // CSS Gradients
    () => {
        let code = `/* CSS Gradients */\n`;
        code += `body {\n    background: `;

        let codeElements = [];
        codeElements.length = elements.length;

        elements.forEach((element) => {
            let sortingPos = element.getSortingPos();

            if (element.getType() == "rect") {
                // Rectangle
                codeElements[
                    sortingPos
                ] = `linear-gradient(0deg, ${element.getColor()}, ${element.getColor()}) ${element.getX()}px ${element.getY()}px/${element.getWidth()}px ${element.getHeight()}px no-repeat, `;
            } else if (element.getType() == "circle") {
                // Circle
                codeElements[
                    sortingPos
                ] = `radial-gradient(${element.getColor()} ${
                    element.getWidth() / 2
                }px, transparent ${
                    element.getWidth() / 2
                }px) ${element.getX()}px ${element.getY()}px/${element.getWidth()}px ${element.getHeight()}px no-repeat, `;
            } else if (element.getType() == "triangle") {
                /// Triangle
                // Get leg length
                let legLength = Math.sqrt(
                    Math.pow(element.getHeight(), 2) +
                        Math.pow(element.getWidth() / 2, 2)
                );

                // Get COS(angle)
                let angleCos =
                    (Math.pow(legLength, 2) +
                        Math.pow(legLength, 2) -
                        Math.pow(element.getWidth(), 2)) /
                    (2 * legLength * legLength);

                // Get angle
                let angle = Math.acos(angleCos) * (180 / Math.PI);

                let startDeg = 180 - angle / 2;

                codeElements[
                    sortingPos
                ] = `conic-gradient(from ${startDeg}deg at 50% 0%, transparent 0deg, ${element.getColor()} 0deg ${angle}deg, transparent 0deg) ${element.getX()}px ${element.getY()}px/${element.getWidth()}px ${element.getHeight()}px no-repeat, `;
            }
        });

        for (let i = codeElements.length - 1; i >= 0; i--) {
            code += codeElements[i];
        }

        code += "transparent;\n}";

        return code;
    },
    // Separated Inline CSS
    () => {
        let code = `<!-- Separated Inline CSS -->\n`;
        code += `<div style="position: relative;">`;

        let codeElements = [];
        codeElements.length = elements.length;

        elements.forEach((element) => {
            let sortingPos = element.getSortingPos();
            let codeElement = "";

            if (element.getType() == "rect") {
                // Rectangle
                codeElement = `<div style="background: ${element.getColor()}; position: absolute; left: ${element.getX()}px; top: ${element.getY()}px; width: ${element.getWidth()}px; height: ${element.getHeight()}px;"></div>`;
            } else if (element.getType() == "circle") {
                // Circle
                codeElement = `<div style="background: ${element.getColor()}; position: absolute; left: ${element.getX()}px; top: ${element.getY()}px; width: ${element.getWidth()}px; height: ${element.getHeight()}px; border-radius: 100%;"></div>`;
            } else if (element.getType() == "triangle") {
                /// Triangle
                codeElement = `<div style="background: ${element.getColor()}; position: absolute; left: ${element.getX()}px; top: ${element.getY()}px; width: ${element.getWidth()}px; height: ${element.getHeight()}px; clip-path: polygon(50% 0%, 100% 100%, 0% 100%);"></div>`;
            }

            codeElements[sortingPos] = codeElement;
        });

        for (let i = codeElements.length - 1; i >= 0; i--) {
            code += codeElements[i];
        }

        code += `</div>`;

        return code;
    },
];

// Element queries
const canvasDOM = document.querySelector("#canvas");
const creationElementsDOM = document.querySelector("#creation-elements");

const codeViewDOM = document.querySelector("#code-view");
const codeTypeDOM = document.querySelector("#code-type");
const generateCodeDOM = document.querySelector("#generate-code");
const codeOutputDOM = document.querySelector("#code-output");
const copyCodeDOM = document.querySelector("#copy-code");

const elementListDOM = document.querySelector("#element-list");
const elementListUpBtnDOM = document.querySelector(".element-list-up-btn");
const elementListDownBtnDOM = document.querySelector(".element-list-down-btn");

const elementXInputDOM = document.querySelector("#element-x");
const elementYInputDOM = document.querySelector("#element-y");
const elementWidthInputDOM = document.querySelector("#element-width");
const elementHeightInputDOM = document.querySelector("#element-height");
const elementColorInputDOM = document.querySelector("#element-color");

// Classes
class TimelineElement {
    constructor(type, ...args) {
        this.type = type;
        this.args = args;
    }

    undo() {}

    redo() {}
}

class DragElement {
    constructor(element, name) {
        this.index = elements.length;
        this.sortingPos = this.index;
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.color = "#2980c1";
        this.width = element.clientWidth;
        this.height = element.clientHeight;
        this.listDOM = this.createListItem();
        this.elementDOM = element.cloneNode(true);
        this.type = this.elementDOM.getAttribute("data-type");

        this.elementDOM.setAttribute("data-index", this.index);
        this.elementDOM.style.zIndex = this.sortingPos;
        canvasDOM.appendChild(this.elementDOM);
        elements.push(this);
    }

    copy() {
        const el = new DragElement(
            this.elementDOM.cloneNode(true),
            this.name + " clone"
        );

        el.setX(this.x);
        el.setY(this.y);
        el.setWidth(this.width);
        el.setHeight(this.height);
        el.setColor(this.color);

        return el;
    }

    getElement() {
        return this.elementDOM;
    }

    getSortingPos() {
        return this.sortingPos;
    }

    getName() {
        return this.name;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getColor() {
        return this.color;
    }

    getType() {
        return this.type;
    }

    createListItem() {
        const listElement = document.createElement("li");
        listElement.className = "list-item list-item-square";

        const buttonElement = document.createElement("button");
        buttonElement.className = "btn btn-block text-justify";

        const textElement = document.createElement("p");
        textElement.className = "list-item-title";
        textElement.textContent = this.name;

        buttonElement.appendChild(textElement);
        listElement.appendChild(buttonElement);

        if (elementListDOM.children.length > 0) {
            elementListDOM.insertBefore(
                listElement,
                elementListDOM.children[0]
            );
        } else {
            elementListDOM.appendChild(listElement);
        }

        buttonElement.addEventListener("click", () => {
            changeSelectedElement(this);
        });

        return listElement;
    }

    setIndex(index) {
        this.index = index;
        this.elementDOM.setAttribute("data-index", this.index);
    }

    setName(name) {
        this.name = name;
        this.listDOM.querySelector(".btn").textContent = name;
    }

    setX(x) {
        this.x = x;
        this.updatePosition();
        updateElementValues();
    }

    setY(y) {
        this.y = y;
        this.updatePosition();
        updateElementValues();
    }

    setSortingPos(sortingPos) {
        let previousSortingPos = this.sortingPos;

        if (sortingPos < 0) {
            sortingPos = 0;
        } else if (sortingPos >= elements.length) {
            sortingPos = elements.length - 1;
        }

        this.sortingPos = sortingPos;
        this.elementDOM.style.zIndex = this.sortingPos;

        // Resort other elements
        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            if (i != this.index && el.sortingPos == this.sortingPos) {
                el.sortingPos = previousSortingPos;
                el.elementDOM.style.zIndex = el.sortingPos;
                break;
            }
        }
    }

    setWidth(width) {
        this.width = width;
        this.elementDOM.style.width = width + "px";
        updateElementValues();
    }

    setHeight(height) {
        this.height = height;
        this.elementDOM.style.height = height + "px";
        updateElementValues();
    }

    setColor(color) {
        this.color = color;
        this.elementDOM.querySelector(".fill").style.backgroundColor = color;
        updateElementValues();
    }

    updatePosition() {
        this.elementDOM.style.webkitTransform = this.elementDOM.style.transform =
            "translate(" + this.x + "px, " + this.y + "px)";
    }

    restrictX(x) {
        if (x < 0) {
            x = 0;
        } else if (x + this.width > canvasDOM.clientWidth) {
            x = canvasDOM.clientWidth - this.width;
        }

        this.setX(x);
    }

    restrictY(y) {
        if (y < 0) {
            y = 0;
        } else if (y + this.height > canvasDOM.clientHeight) {
            y = canvasDOM.clientHeight - this.height;
        }

        this.setY(y);
    }

    restrictWidth(width) {
        if (width < 1) {
            width = 1;
        } else if (width + this.x > canvasDOM.clientWidth) {
            width = canvasDOM.clientWidth - this.x;
        }

        this.setWidth(width);
    }

    restrictHeight(height) {
        if (height < 1) {
            height = 1;
        } else if (height + this.y > canvasDOM.clientHeight) {
            height = canvasDOM.clientHeight - this.y;
        }

        this.setHeight(height);
    }

    destroy() {
        elements.splice(this.index, 1);

        for (let i = 0; i < elements.length; i++) {
            let el = elements[i];
            if (el.getSortingPos() > this.sortingPos) {
                el.sortingPos--;
                el.elementDOM.style.zIndex = el.sortingPos;
            }

            el.setIndex(i);
        }

        this.listDOM.remove();
        this.elementDOM.remove();
    }
}

// Functions
const generateCode = () => {
    codeOutputDOM.textContent = outputTypes[parseInt(codeTypeDOM.value)]();
};

const changeSelectedElement = (newElement) => {
    // Change selected element
    if (selectedElement) {
        selectedElement.getElement().classList.remove("selected");
        selectedElement.listDOM.classList.remove("selected");
    }
    selectedElement = newElement;

    // Modify inputs
    if (selectedElement) {
        selectedElement.getElement().classList.add("selected");
        selectedElement.listDOM.classList.add("selected");

        // Enable inputs
        elementXInputDOM.removeAttribute("disabled");
        elementYInputDOM.removeAttribute("disabled");
        elementWidthInputDOM.removeAttribute("disabled");
        elementHeightInputDOM.removeAttribute("disabled");
        elementColorInputDOM.removeAttribute("disabled");

        elementListUpBtnDOM.removeAttribute("disabled");
        elementListDownBtnDOM.removeAttribute("disabled");

        updateElementValues();
    } else {
        // Disable inputs
        elementXInputDOM.setAttribute("disabled", "");
        elementYInputDOM.setAttribute("disabled", "");
        elementWidthInputDOM.setAttribute("disabled", "");
        elementHeightInputDOM.setAttribute("disabled", "");
        elementColorInputDOM.setAttribute("disabled", "");

        elementListUpBtnDOM.setAttribute("disabled", "");
        elementListDownBtnDOM.setAttribute("disabled", "");
    }
};

const updateElementValues = () => {
    // Set values
    if (selectedElement != undefined) {
        elementXInputDOM.value = selectedElement.getX();
        elementYInputDOM.value = selectedElement.getY();
        elementWidthInputDOM.value = selectedElement.getWidth();
        elementHeightInputDOM.value = selectedElement.getHeight();
        elementColorInputDOM.value = selectedElement.getColor();
    }
};

const resizeEast = (event) => {
    let newWidth =
        dragOriginalX -
        (event.clientX - canvasDOM.getBoundingClientRect().left) -
        dragOriginalWidth +
        mouseOffsetX;

    dragging.restrictWidth(Math.abs(newWidth));

    if (newWidth < 0) {
        dragging.restrictX(dragOriginalX);
    } else {
        dragging.restrictX(dragOriginalX - dragging.getWidth());
    }

    if (event.shiftKey) {
        dragging.restrictHeight(
            (dragOriginalHeight / dragOriginalWidth) * dragging.getWidth()
        );
    }
};

const resizeSouth = (event) => {
    let newHeight =
        dragOriginalY -
        (event.clientY - canvasDOM.getBoundingClientRect().top) -
        dragOriginalHeight +
        mouseOffsetY;

    dragging.restrictHeight(Math.abs(newHeight));

    if (newHeight < 0) {
        dragging.restrictY(dragOriginalY);
    } else {
        dragging.restrictY(dragOriginalY - dragging.getHeight());
    }
};

const resizeWest = (event) => {
    let newWidth =
        dragOriginalX -
        (event.clientX - canvasDOM.getBoundingClientRect().left) +
        dragOriginalWidth +
        mouseOffsetX;

    dragging.restrictWidth(Math.abs(newWidth));

    if (newWidth > 0) {
        dragging.restrictX(
            dragOriginalX - (dragging.getWidth() - dragOriginalWidth)
        );
    } else {
        dragging.restrictX(dragOriginalX + dragOriginalWidth);
    }

    if (event.shiftKey) {
        dragging.restrictHeight(
            (dragOriginalHeight / dragOriginalWidth) * dragging.getWidth()
        );

        dragging.restrictY(
            dragOriginalY - (dragging.getHeight() - dragOriginalHeight)
        );
    }
};

const resizeNorth = (event) => {
    let newHeight =
        dragOriginalY -
        (event.clientY - canvasDOM.getBoundingClientRect().top) +
        dragOriginalHeight +
        mouseOffsetY;

    dragging.restrictHeight(Math.abs(newHeight));

    if (newHeight > 0) {
        dragging.restrictY(
            dragOriginalY - (dragging.getHeight() - dragOriginalHeight)
        );
    } else {
        dragging.restrictY(dragOriginalY + dragOriginalHeight);
    }
};

// Interaction
let dragging = undefined;
let dragType = "";
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let dragOriginalX = 0;
let dragOriginalY = 0;
let dragOriginalWidth = 0;
let dragOriginalHeight = 0;
let sentTriangleWarning = false;

creationElementsDOM.addEventListener("mousedown", (event) => {
    if (dragging == undefined) {
        let el;
        if (event.target.classList.contains("creation-element")) {
            el = new DragElement(event.target, "Element");
        } else if (event.target.classList.contains("fill")) {
            el = new DragElement(event.target.parentNode, "Element");
        } else {
            return;
        }

        dragging = el;
        changeSelectedElement(el);

        if (
            parseInt(codeTypeDOM.value) == 0 &&
            el.getType() == "triangle" &&
            !sentTriangleWarning
        ) {
            halfmoon.initStickyAlert({
                content:
                    "Please see the browser support for conic-gradient() before using triangles in production.",
                title: "Warning",
            });
            sentTriangleWarning = true;
        }

        dragType = "move";
        mouseOffsetX =
            event.clientX - event.target.getBoundingClientRect().left;
        mouseOffsetY = event.clientY - event.target.getBoundingClientRect().top;

        el.restrictX(
            event.clientX -
                mouseOffsetX -
                canvasDOM.getBoundingClientRect().left
        );
        el.restrictY(
            event.clientY - mouseOffsetY - canvasDOM.getBoundingClientRect().top
        );
    }
});

canvasDOM.addEventListener("mousemove", (event) => {
    // Change cursor
    if (dragging == undefined) {
        let el;
        if (event.target.classList.contains("creation-element")) {
            el = event.target;
        } else if (event.target.classList.contains("fill")) {
            el = event.target.parentNode;
        } else {
            return;
        }

        let box = el.getBoundingClientRect();
        let edgeSize = 10;
        let edge = 0;

        // East
        if (
            event.clientX <= box.right &&
            event.clientX >= box.right - edgeSize
        ) {
            edge = 2;
            el.style.cursor = "e-resize";
        }
        // West
        else if (
            event.clientX >= box.left &&
            event.clientX <= box.left + edgeSize
        ) {
            edge = 1;
            el.style.cursor = "w-resize";
        }

        if (
            event.clientY <= box.bottom &&
            event.clientY >= box.bottom - edgeSize
        ) {
            if (edge == 1) {
                // South west
                el.style.cursor = "sw-resize";
            } else if (edge == 2) {
                // South east
                el.style.cursor = "se-resize";
            } else {
                // South
                el.style.cursor = "s-resize";
            }
            edge = 3;
        } else if (
            event.clientY >= box.top &&
            event.clientY <= box.top + edgeSize
        ) {
            if (edge == 1) {
                // North west
                el.style.cursor = "nw-resize";
            } else if (edge == 2) {
                // North east
                el.style.cursor = "ne-resize";
            } else {
                // North
                el.style.cursor = "n-resize";
            }
            edge = 3;
        }

        if (edge == 0) {
            el.style.cursor = "move";
        }
    }
});

document.body.addEventListener("mousemove", (event) => {
    if (dragging != undefined) {
        switch (dragType) {
            case "move":
                dragging.restrictX(
                    event.clientX -
                        mouseOffsetX -
                        canvasDOM.getBoundingClientRect().left
                );
                dragging.restrictY(
                    event.clientY -
                        mouseOffsetY -
                        canvasDOM.getBoundingClientRect().top
                );
                break;

            case "n-resize":
                resizeNorth(event);
                break;

            case "s-resize":
                resizeSouth(event);
                break;

            case "e-resize":
                resizeEast(event);
                break;

            case "w-resize":
                resizeWest(event);
                break;

            case "sw-resize":
                resizeSouth(event);
                resizeWest(event);
                break;

            case "se-resize":
                resizeSouth(event);
                resizeEast(event);
                break;

            case "nw-resize":
                resizeNorth(event);
                resizeWest(event);
                break;

            case "ne-resize":
                resizeNorth(event);
                resizeEast(event);
                break;
        }
    }
});

window.addEventListener("mouseup", (event) => {
    if (dragging) {
        timeline.push(
            new TimelineElement(
                "drag",
                dragging,
                dragOriginalX,
                dragOriginalY,
                dragOriginalWidth,
                dragOriginalHeight
            )
        );
        timelinePosition = timeline.length - 1;
    }

    dragging = undefined;
});

// List movement
// Move up
elementListUpBtnDOM.addEventListener("click", () => {
    let el;
    if (selectedElement) el = selectedElement.listDOM;

    if (el && el.previousElementSibling) {
        // Move element
        elementListDOM.insertBefore(el, el.previousElementSibling);

        // Move sorting position
        selectedElement.setSortingPos(selectedElement.getSortingPos() + 1);
    }
});

// Move down
elementListDownBtnDOM.addEventListener("click", () => {
    let el;
    if (selectedElement) el = selectedElement.listDOM;

    if (el) {
        // Move element
        if (el.nextElementSibling && el.nextElementSibling.nextElementSibling) {
            elementListDOM.insertBefore(
                el,
                el.nextElementSibling.nextElementSibling
            );
        } else {
            elementListDOM.appendChild(el);
        }

        // Move sorting position
        selectedElement.setSortingPos(selectedElement.getSortingPos() - 1);
    }
});

// Event listeners
canvasDOM.addEventListener("mousedown", (event) => {
    if (dragging == undefined) {
        let el;
        let target;
        if (event.target.classList.contains("creation-element")) {
            target = event.target;
        } else if (event.target.classList.contains("fill")) {
            target = event.target.parentNode;
        } else {
            changeSelectedElement(undefined);
            return;
        }

        el = elements[parseInt(target.getAttribute("data-index"))];
        dragging = el;

        dragType = target.style.cursor;
        mouseOffsetX = event.clientX - target.getBoundingClientRect().left;
        mouseOffsetY = event.clientY - target.getBoundingClientRect().top;
        dragOriginalWidth = el.getWidth();
        dragOriginalHeight = el.getHeight();
        dragOriginalX = el.getX();
        dragOriginalY = el.getY();

        changeSelectedElement(el);
    }
});

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        // Delete
        case "Delete":
            if (selectedElement) {
                timeline.push(new TimelineElement("delete", selectedElement));
                timelinePosition = timeline.length - 1;

                selectedElement.destroy();
                changeSelectedElement(undefined);
            }
            break;

        // Shift
        case "Shift":
            shiftHeld = true;
            break;

        // Copy
        case "c":
            if (
                event.ctrlKey &&
                selectedElement &&
                selectedElement.getElement().parentNode === canvasDOM
            ) {
                clipboard = selectedElement;
            }
            break;

        // Paste
        case "v":
            if (event.ctrlKey && clipboard) {
                timeline.push(new TimelineElement("paste", clippedElement));
                timelinePosition = timeline.length - 1;

                let clippedElement = clipboard.copy();
                changeSelectedElement(clippedElement);
            }
            break;

        // Undo
        case "z":
            if (event.ctrlKey && timelinePosition > 0) {
                timelinePosition--;

                timeline[timelinePosition].undo();
            }
            break;

        // Redo
        case "r":
            if (event.ctrlKey && timelinePosition + 1 < timeline.length) {
                timelinePosition++;

                timeline[timelinePosition].redo();
            }
            break;

        default:
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        // Shift
        case "Shift":
            shiftHeld = false;
            break;

        default:
            break;
    }
});

copyCodeDOM.addEventListener("click", () => {
    codeOutputDOM.select();
    document.execCommand("copy");
});

generateCodeDOM.addEventListener("click", generateCode);

// Element X
elementXInputDOM.addEventListener("input", (event) => {
    if (selectedElement) {
        selectedElement.restrictX(parseInt(event.target.value));
    }
});

// Element Y
elementYInputDOM.addEventListener("input", (event) => {
    if (selectedElement) {
        selectedElement.restrictY(parseInt(event.target.value));
    }
});

// Element Width
elementWidthInputDOM.addEventListener("input", (event) => {
    if (selectedElement) {
        selectedElement.setWidth(parseInt(event.target.value));
    }
});

// Element height
elementHeightInputDOM.addEventListener("input", (event) => {
    if (selectedElement) {
        selectedElement.setHeight(parseInt(event.target.value));
    }
});

// Element color
elementColorInputDOM.addEventListener("input", (event) => {
    if (selectedElement) {
        selectedElement.setColor(event.target.value);
    }
});
