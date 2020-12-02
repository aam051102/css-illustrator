import interact from "https://cdn.interactjs.io/v1.10.0/interactjs/index.js";

let selectedElement = undefined;
let clipboard = undefined;
let shiftHeld = false;
let elements = [];

// Element queries
const canvasDOM = document.querySelector("#canvas");
const codeOutputDOM = document.querySelector("#code-output");
const codeGenerateDOM = document.querySelector("#code-generate");
const elementListDOM = document.querySelector("#element-list");

const elementXInputDOM = document.querySelector("#element-x");
const elementYInputDOM = document.querySelector("#element-y");
const elementWidthInputDOM = document.querySelector("#element-width");
const elementHeightInputDOM = document.querySelector("#element-height");
const elementColorInputDOM = document.querySelector("#element-color");

// Classes
class Element {
    constructor(element, name) {
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.color = "#ffffff";
        this.width = 20;
        this.height = 20;
        this.listDOM = this.createListItem();
        this.elementDOM = element;

        this.elementDOM.setAttribute("data-index", elements.length);
    }

    copy() {
        const el = new Element(
            this.elementDOM.cloneNode(true),
            this.name + " clone"
        );

        el.setX(this.x);
        el.setY(this.y);
        el.setWidth(this.width);
        el.setHeight(this.height);
        el.setColor(this.color);
        el.setAttribute("data-index", elements.length);

        canvasDOM.appendChild(el.getElement());

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
        this.elementDOM.setAttribute("data-x", x);
        this.updatePosition();
        updateElementValues();
    }

    setY(y) {
        this.y = y;
        this.elementDOM.setAttribute("data-y", y);
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

    destroy() {
        elements[this.elementDOM.getAttribute("data-index")] = null;
        this.listDOM.remove();
        this.elementDOM.remove();
    }
}

// Functions
const generateCode = () => {
    let code = "body {\n    background-color: ";

    elements.forEach((element) => {
        if (true) {
            code += `linear-gradient() 0px 0px/0px 0px, `;
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
    /*elementXInputDOM.value = selectedElement.getX();
    elementYInputDOM.value = selectedElement.getY();
    elementWidthInputDOM.value = selectedElement.getWidth();
    elementHeightInputDOM.value = selectedElement.getHeight();
    elementColorInputDOM.value = selectedElement.getColor();*/
};

const moveListener = (event) => {
    if (event.interaction.pointerIsDown && !event.interaction.interacting()) {
        if (event.currentTarget.style.cursor === "") {
            let el = event.currentTarget.cloneNode(true);
            canvasDOM.appendChild(el);

            let element = new Element(el, "Element");
            changeSelectedElement(element, "Element");

            let x =
                event.clientX -
                event.currentTarget.clientWidth / 2 -
                canvasDOM.getBoundingClientRect().left;
            let y =
                event.clientY -
                canvasDOM.getBoundingClientRect().top -
                event.currentTarget.clientHeight / 2;

            element.setX(x);
            element.setY(y);

            elements.push(element);

            event.interaction.start({ name: "drag" }, event.interactable, el);
        }
    }
};

const dragMoveListener = (event) => {
    if (!isNaN(event.dx) && !isNaN(event.dy)) {
        let el = elements[parseInt(event.target.getAttribute("data-index"))];

        let x = (parseFloat(el.getX()) || 0) + event.dx;
        let y = (parseFloat(el.getY()) || 0) + event.dy;

        el.setX(x);
        el.setY(y);
    }
};

const resizeMoveListener = (event) => {
    let el = elements[parseInt(event.target.getAttribute("data-index"))];

    let x = parseFloat(el.getX()) || 0;
    let y = parseFloat(el.getY()) || 0;

    el.setWidth(event.rect.width);
    el.setHeight(event.rect.height);

    el.setX(x + event.deltaRect.left);
    el.setY(y + event.deltaRect.top);
};

// Creation elements
interact("#creation-elements .creation-element")
    .draggable({
        listeners: {
            move: dragMoveListener,
        },
        manualStart: true,
        inertia: false,
        modifiers: [
            interact.modifiers.restrict({
                restriction: "#canvas",
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                endOnly: false,
            }),
        ],
    })
    .on("move", moveListener);

// Canvas element control
interact("#canvas .creation-element")
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true },

        listeners: {
            move: resizeMoveListener,
        },
        modifiers: [
            interact.modifiers.restrictEdges({
                outer: "#canvas",
            }),
        ],
        inertia: false,
    })
    .draggable({
        listeners: {
            move: dragMoveListener,
        },
        inertia: false,
        modifiers: [
            interact.modifiers.restrict({
                restriction: "#canvas",
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                endOnly: false,
            }),
        ],
    });

// Event listeners
canvasDOM.addEventListener("click", (event) => {
    if (event.target !== canvasDOM) {
        changeSelectedElement(
            elements[parseInt(event.target.getAttribute("data-index"))]
        );
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
elementXInputDOM.addEventListener("change", (event) => {
    if (selectedElement) {
        selectedElement.setX(event.target.value);
    }
});

// Element Y
elementYInputDOM.addEventListener("change", (event) => {
    if (selectedElement) {
        selectedElement.setY(event.target.value);
    }
});

// Element Width
elementWidthInputDOM.addEventListener("change", (event) => {
    if (selectedElement) {
        selectedElement.setWidth(event.target.value);
    }
});

// Element height
elementHeightInputDOM.addEventListener("change", (event) => {
    if (selectedElement) {
        selectedElement.setHeight(event.target.value);
    }
});

// Element color
elementColorInputDOM.addEventListener("change", (event) => {
    if (selectedElement) {
        selectedElement.setColor(event.target.value);
    }
});
