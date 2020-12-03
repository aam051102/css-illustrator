let selectedElement = undefined;
let clipboard = undefined;
let shiftHeld = false;
let elements = [];

// Element queries
const canvasDOM = document.querySelector("#canvas");
const codeOutputDOM = document.querySelector("#code-output");
const codeGenerateDOM = document.querySelector("#code-generate");
const elementListDOM = document.querySelector("#element-list");
const creationElementsDOM = document.querySelector("#creation-elements");

const elementXInputDOM = document.querySelector("#element-x");
const elementYInputDOM = document.querySelector("#element-y");
const elementWidthInputDOM = document.querySelector("#element-width");
const elementHeightInputDOM = document.querySelector("#element-height");
const elementColorInputDOM = document.querySelector("#element-color");

// Classes
class DragElement {
    constructor(element, name) {
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.color = "#2980c1";
        this.width = element.clientWidth;
        this.height = element.clientHeight;
        this.listDOM = this.createListItem();
        this.elementDOM = element.cloneNode(true);
        this.type = this.elementDOM.getAttribute("data-type");

        this.elementDOM.setAttribute("data-index", elements.length);
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

        canvasDOM.appendChild(el.getElement());
        elements.push(this);

        return el;
    }

    getElement() {
        return this.elementDOM;
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
        buttonElement.textContent = this.name;

        listElement.appendChild(buttonElement);
        elementListDOM.appendChild(listElement);

        buttonElement.addEventListener("click", () => {
            changeSelectedElement(this);
        });

        return listElement;
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
        this.elementDOM.style.backgroundColor = color;
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
        elements[this.elementDOM.getAttribute("data-index")] = null;
        this.listDOM.remove();
        this.elementDOM.remove();
    }
}

// Functions
const generateCode = () => {
    let code = "body {\n    background: ";

    let codeElements = elements;
    codeElements.reverse();

    codeElements.forEach((element) => {
        if (element.getType() == "rect") {
            code += `linear-gradient(to bottom, ${element.getColor()}, ${element.getColor()}) ${element.getX()}px ${element.getY()}px/${element.getWidth()}px ${element.getHeight()}px no-repeat, `;
        } else if (element.getType() == "circle") {
            code += `radial-gradient(${element.getColor()} ${
                element.getWidth() / 2
            }px, transparent ${
                element.getWidth() / 2
            }px) ${element.getX()}px ${element.getY()}px/${element.getWidth()}px ${element.getHeight()}px no-repeat, `;
        }
    });

    code += "transparent;\n}";

    codeOutputDOM.textContent = code;
};

const changeSelectedElement = (newElement) => {
    // Change selected element
    if (selectedElement)
        selectedElement.getElement().classList.remove("selected");
    selectedElement = newElement;

    // Modify inputs
    if (selectedElement) {
        selectedElement.getElement().classList.add("selected");

        // Enable inputs
        elementXInputDOM.removeAttribute("disabled");
        elementYInputDOM.removeAttribute("disabled");
        elementWidthInputDOM.removeAttribute("disabled");
        elementHeightInputDOM.removeAttribute("disabled");
        elementColorInputDOM.removeAttribute("disabled");

        updateElementValues();
    } else {
        // Disable inputs
        elementXInputDOM.setAttribute("disabled", "");
        elementYInputDOM.setAttribute("disabled", "");
        elementWidthInputDOM.setAttribute("disabled", "");
        elementHeightInputDOM.setAttribute("disabled", "");
        elementColorInputDOM.setAttribute("disabled", "");
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

// Interaction
let dragging = undefined;
let dragType = "";
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let dragOriginalX = 0;
let dragOriginalY = 0;
let dragOriginalWidth = 0;
let dragOriginalHeight = 0;

creationElementsDOM.addEventListener("mousedown", (event) => {
    if (
        dragging == undefined &&
        event.target.classList.contains("creation-element")
    ) {
        let el = new DragElement(event.target, "Element");

        dragging = el;
        changeSelectedElement(el);

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
    if (
        event.target.classList.contains("creation-element") &&
        dragging == undefined
    ) {
        let box = event.target.getBoundingClientRect();
        let edgeSize = 10;
        let edge = 0;

        // West
        if (event.clientX >= box.left && event.clientX <= box.left + edgeSize) {
            edge = 1;
            event.target.style.cursor = "w-resize";
        }
        // East
        else if (
            event.clientX <= box.right &&
            event.clientX >= box.right - edgeSize
        ) {
            edge = 2;
            event.target.style.cursor = "e-resize";
        }

        if (event.clientY >= box.top && event.clientY <= box.top + edgeSize) {
            if (edge == 1) {
                // North west
                event.target.style.cursor = "nw-resize";
            } else if (edge == 2) {
                // North east
                event.target.style.cursor = "ne-resize";
            } else {
                // North
                event.target.style.cursor = "n-resize";
            }
            edge = 3;
        } else if (
            event.clientY <= box.bottom &&
            event.clientY >= box.bottom - edgeSize
        ) {
            if (edge == 1) {
                // South west
                event.target.style.cursor = "sw-resize";
            } else if (edge == 2) {
                // South east
                event.target.style.cursor = "se-resize";
            } else {
                // South
                event.target.style.cursor = "s-resize";
            }
            edge = 3;
        }

        if (edge == 0) {
            event.target.style.cursor = "move";
        }
    }
});

const resizeEast = (event) => {
    dragging.restrictWidth(
        event.clientX -
            canvasDOM.getBoundingClientRect().left -
            dragging.getX() +
            (dragOriginalWidth - mouseOffsetX)
    );
};

const resizeSouth = (event) => {
    dragging.restrictHeight(
        event.clientY -
            canvasDOM.getBoundingClientRect().top -
            dragging.getY() +
            (dragOriginalHeight - mouseOffsetY)
    );
};

const resizeWest = (event) => {
    dragging.restrictX(
        event.clientX - canvasDOM.getBoundingClientRect().left - mouseOffsetX
    );
    dragging.restrictWidth(
        dragOriginalX -
            (event.clientX - canvasDOM.getBoundingClientRect().left) +
            dragOriginalWidth +
            mouseOffsetX
    );
};

const resizeNorth = (event) => {
    dragging.restrictY(
        event.clientY - canvasDOM.getBoundingClientRect().top - mouseOffsetY
    );
    dragging.restrictHeight(
        dragOriginalY -
            (event.clientY - canvasDOM.getBoundingClientRect().top) +
            dragOriginalHeight +
            mouseOffsetY
    );
};

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

document.body.addEventListener("mouseup", (event) => {
    dragging = undefined;
});

// Event listeners
canvasDOM.addEventListener("mousedown", (event) => {
    if (event.target !== canvasDOM && dragging == undefined) {
        let el = elements[parseInt(event.target.getAttribute("data-index"))];
        dragging = el;

        dragType = event.target.style.cursor;
        mouseOffsetX =
            event.clientX - event.target.getBoundingClientRect().left;
        mouseOffsetY = event.clientY - event.target.getBoundingClientRect().top;
        dragOriginalWidth = el.getWidth();
        dragOriginalHeight = el.getHeight();
        dragOriginalX = el.getX();
        dragOriginalY = el.getY();

        changeSelectedElement(el);
    } else {
        changeSelectedElement(undefined);
    }
});

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        // Delete
        case "Delete":
            if (selectedElement) {
                selectedElement.destroy();
                selectedElement = undefined;
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
                selectedElement.getElement().parentNode === canvasDOM
            ) {
                clipboard = selectedElement;
            }
            break;

        // Paste
        case "v":
            if (event.ctrlKey && clipboard) {
                let clippedElement = clipboard.copy();
                elements.push(clippedElement);

                changeSelectedElement(clippedElement);
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

codeGenerateDOM.addEventListener("click", generateCode);

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
