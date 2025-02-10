// APCA Constants
const APCAConstants = {
    mainTRC: 2.4,
    get mainTRCencode() { return 1 / this.mainTRC },
    sRco: 0.2126729,
    sGco: 0.7151522,
    sBco: 0.072175,
    normBG: 0.56,
    normTXT: 0.57,
    revTXT: 0.62,
    revBG: 0.65,
    blkThrs: 0.022,
    blkClmp: 1.414,
    scaleBoW: 1.14,
    scaleWoB: 1.14,
    loBoWoffset: 0.027,
    loWoBoffset: 0.027,
    deltaYmin: 0.0005,
    loClip: 0.1,
    mFactor: 1.9468554433171,
    get mFactInv() { return 1 / this.mFactor },
    mOffsetIn: 0.0387393816571401,
    mExpAdj: 0.283343396420869,
    get mExp() { return this.mExpAdj / this.blkClmp },
    mOffsetOut: 0.312865795870758
};

// State variables
let foregroundColor = "#000000";
let backgroundColor = "#FFFFFF";
let wcagContrast = null;
let apcaContrast = null;
let selectionMode = "none";

function initializeClickHandlers() {
    // Helper function to convert RGB to Hex
    function rgbToHex(rgb) {
        // Extract rgb values
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        // Convert to hex
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Helper function to update color based on selection mode
    function updateSelectedColor(newColor) {
        if (selectionMode === 'foreground') {
            const foregroundPicker = document.getElementById('foregroundHTMLPicker');
            if (foregroundPicker) {
                foregroundPicker.value = newColor;
                updateColor(newColor, 'foreground');
            }
        } else if (selectionMode === 'background') {
            const backgroundPicker = document.getElementById('backgroundHTMLPicker');
            if (backgroundPicker) {
                backgroundPicker.value = newColor;
                updateColor(newColor, 'background');
            }
        }
    }

    // Initialize color swatches
    document.querySelectorAll('.frame-color').forEach(swatch => {
        swatch.addEventListener('click', () => {
            // Get the computed color from the ::after pseudo-element
            const computedStyle = getComputedStyle(swatch, '::after');
            const backgroundColor = computedStyle.backgroundColor;
            const hexColor = rgbToHex(backgroundColor);
            updateSelectedColor(hexColor);
        });
    });

    // Initialize text click handlers
    document.querySelectorAll('.canvas h1, .canvas p').forEach(element => {
        element.addEventListener('click', () => {
            updateSelectedColor('#000000');
        });
    });
}

// APCA Contrast calculation functions
function calculateAPCAContrast(textY, bgY, decimals = -1) {
    const bounds = [0, 1.1];
    if (isNaN(textY) || isNaN(bgY) || Math.min(textY, bgY) < bounds[0] || Math.max(textY, bgY) > bounds[1]) {
        return 0;
    }

    let outputContrast = 0;
    let polarity = "BoW";
    
    // Apply black level compensation
    textY = textY > APCAConstants.blkThrs ? 
        textY : 
        textY + Math.pow(APCAConstants.blkThrs - textY, APCAConstants.blkClmp);
    
    bgY = bgY > APCAConstants.blkThrs ? 
        bgY : 
        bgY + Math.pow(APCAConstants.blkThrs - bgY, APCAConstants.blkClmp);

    if (Math.abs(bgY - textY) < APCAConstants.deltaYmin) {
        return 0;
    }

    // Calculate contrast based on relative luminance
    if (bgY > textY) {
        const contrast = (Math.pow(bgY, APCAConstants.normBG) - Math.pow(textY, APCAConstants.normTXT)) * APCAConstants.scaleBoW;
        outputContrast = contrast < APCAConstants.loClip ? 0 : contrast - APCAConstants.loBoWoffset;
    } else {
        polarity = "WoB";
        const contrast = (Math.pow(bgY, APCAConstants.revBG) - Math.pow(textY, APCAConstants.revTXT)) * APCAConstants.scaleWoB;
        outputContrast = contrast > -APCAConstants.loClip ? 0 : contrast + APCAConstants.loWoBoffset;
    }

    if (decimals < 0) {
        return outputContrast * 100;
    } else if (decimals === 0) {
        return Math.round(Math.abs(outputContrast) * 100) + "<sub>" + polarity + "</sub>";
    } else if (Number.isInteger(decimals)) {
        return (outputContrast * 100).toFixed(decimals);
    }
    return 0;
}

function sRGBtoY(color = [0, 0, 0]) {
    function toLinear(val) {
        return Math.pow(val / 255, APCAConstants.mainTRC);
    }
    return APCAConstants.sRco * toLinear(color[0]) + 
           APCAConstants.sGco * toLinear(color[1]) + 
           APCAConstants.sBco * toLinear(color[2]);
}

// Color conversion and contrast calculation functions
function calculateWCAGContrast(color1, color2) {
    const rgb1 = hexToRGB(color1);
    const rgb2 = hexToRGB(color2);
    const l1 = relativeLuminance(rgb1);
    const l2 = relativeLuminance(rgb2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return Number(ratio.toFixed(1));
}

function hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
}

function relativeLuminance([r, g, b]) {
    const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculatePerceptualContrast(color1, color2) {
    const rgb1 = hexToRGB(color1).map(c => Math.round(c * 255));
    const rgb2 = hexToRGB(color2).map(c => Math.round(c * 255));
    let contrast = calculateAPCAContrast(sRGBtoY(rgb1), sRGBtoY(rgb2));
    console.log(contrast, sRGBtoY(rgb1), sRGBtoY(rgb2));
    const roundedContrast = Math.round(Number(contrast));
    return Math.abs(Number(roundedContrast));
}

// UI update functions
function updateColor(color, type) {
    if (type === "foreground") {
        foregroundColor = color;
    } else {
        backgroundColor = color;
    }
    updateContrasts();
    updateUI();
    updateContrastResults();
}

function swapColors() {
    const tempBg = backgroundColor;
    const tempFg = foregroundColor;
    console.log(tempBg, tempFg);
    updateColor(tempBg, "foreground");
    updateColor(tempFg, "background");
}

function updateContrasts() {
    wcagContrast = calculateWCAGContrast(foregroundColor, backgroundColor);
    apcaContrast = calculatePerceptualContrast(foregroundColor, backgroundColor);
}

function updateUI() {
    document.documentElement.style.setProperty("--foreground", foregroundColor);
    document.documentElement.style.setProperty("--background", backgroundColor);
    document.querySelector("#foregroundSelector input").value = foregroundColor;
    document.querySelector("#backgroundSelector input").value = backgroundColor;
    document.querySelector("#foregroundHTMLPicker").value = foregroundColor;
    document.querySelector("#backgroundHTMLPicker").value = backgroundColor;
}

function updateContrastResults() {
    const wcagElement = document.getElementById("WCAGtext");
    if (wcagElement) {
        wcagElement.textContent = `${wcagContrast}`;
    }

    const apcaElement = document.getElementById("APCAtext");
    if (apcaElement) {
        apcaElement.textContent = `${apcaContrast}`;
    }

    // Update text size recommendations
    const regularBody = document.getElementById("regularBody");
    const regularOther = document.getElementById("regularOther");
    const boldBody = document.getElementById("boldBody");
    const boldOther = document.getElementById("boldOther");

    if (regularBody && regularOther && boldBody && boldOther && apcaContrast) {
        if (apcaContrast < 15) {
            console.log("low");
            regularBody.innerText = "low";
            regularOther.innerText = "low";
            boldBody.innerText = "low";
            boldOther.innerText = "low";
        } else if ((apcaContrast >= 15 && apcaContrast < 30) || (apcaContrast >= 30 && apcaContrast < 45)) {
            regularBody.innerText = "low";
            regularOther.innerText = "low";
            boldBody.innerText = "low";
            boldOther.innerText = "low";
        } else if (apcaContrast >= 45 && apcaContrast < 60) {
            regularBody.innerText = "low";
            regularOther.innerText = "36px";
            boldBody.innerText = "low";
            boldOther.innerText = "24px";
        } else if (apcaContrast >= 60 && apcaContrast < 75) {
            regularBody.innerText = "low";
            regularOther.innerText = "24px";
            boldBody.innerText = "low";
            boldOther.innerText = "16px";
        } else if (apcaContrast >= 75 && apcaContrast < 90) {
            regularBody.innerText = "18px";
            regularOther.innerText = "15px";
            boldBody.innerText = "14px";
            boldOther.innerText = "12px";
        } else if (apcaContrast >= 90) {
            regularBody.innerText = "14px";
            regularOther.innerText = "12px";
            boldBody.innerText = "max";
            boldOther.innerText = "32px";
        } else {
            regularBody.innerText = "err";
            regularOther.innerText = "err";
            boldBody.innerText = "err";
            boldOther.innerText = "err";
        }
    }

    // Update WCAG criteria checks
    [
        { id: "checkExLargeAA", minContrast: 3 },
        { id: "checkExBodyAA", minContrast: 4.5 },
        { id: "checkBodyAA", minContrast: 4.5 },
        { id: "checkBodyAAA", minContrast: 7 },
        { id: "checkLargeAA", minContrast: 3 },
        { id: "checkLargeAAA", minContrast: 4.5 }
    ].forEach(({ id, minContrast }) => {
        const element = document.getElementById(id);
        if (element && wcagContrast) {
            wcagContrast >= minContrast ? 
                element.classList.add("meetsCriteria") : 
                element.classList.remove("meetsCriteria");
        }
    });
}

function updateSelectionMode(mode) {
    selectionMode = mode;
    const foregroundElement = document.getElementById("foreground");
    const backgroundElement = document.getElementById("background");

    if (!foregroundElement || !backgroundElement) {
        console.error("Could not find foreground or background elements");
        return;
    }

    if (selectionMode === "foreground") {
        foregroundElement.classList.add("active");
        backgroundElement.classList.remove("active");
    } else if (selectionMode === "background") {
        backgroundElement.classList.add("active");
        foregroundElement.classList.remove("active");
    } else {
        foregroundElement.classList.remove("active");
        backgroundElement.classList.remove("active");
    }
}

// Message handler for plugin communication
function handleMessage(event) {
    const message = event.data.pluginMessage;
    if (message) {
        switch (message.type) {
            case "selectionChange":
                console.log("Selection changed:", message.selectionColor);
                updateColor(
                    message.selectionColor,
                    selectionMode === "foreground" ? "foreground" : "background"
                );
                break;
            default:
                console.log("Unknown message type", message.type);
        }
    }
}



// Initialize event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log(
        "foreground", foregroundColor,
        "background", backgroundColor,
        "contrast", wcagContrast,
        "selection mode", selectionMode
    );

    initializeClickHandlers();

    updateColor(foregroundColor, "foreground");
    updateColor(backgroundColor, "background");
    updateUI();

    // Set up click handlers for foreground/background selection
    const foregroundElement = document.getElementById("foreground");
    const backgroundElement = document.getElementById("background");
    if (foregroundElement && backgroundElement) {
        foregroundElement.addEventListener("click", () => updateSelectionMode("foreground"));
        backgroundElement.addEventListener("click", () => updateSelectionMode("background"));
    }

    updateSelectionMode("foreground");

    // Set up form submission handlers
    const foregroundForm = document.getElementById("foregroundSelector");
    const backgroundForm = document.getElementById("backgroundSelector");
    if (foregroundForm && backgroundForm) {
        foregroundForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = foregroundForm.querySelector("input");
            if (input) {
                updateColor(input.value, "foreground");
            }
        });

        backgroundForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = backgroundForm.querySelector("input");
            if (input) {
                updateColor(input.value, "background");
            }
        });
    }

    // Set up color picker handlers
    const foregroundPicker = document.getElementById("foregroundHTMLPicker");
    const backgroundPicker = document.getElementById("backgroundHTMLPicker");
    if (foregroundPicker && backgroundPicker) {
        foregroundPicker.addEventListener("input", (e) => {
            e.preventDefault();
            updateColor(foregroundPicker.value, "foreground");
        });
        backgroundPicker.addEventListener("input", (e) => {
            e.preventDefault();
            updateColor(backgroundPicker.value, "background");
        });
    }

    // Set up swap colors button handler
    const swapButton = document.getElementById("swapColors");
    if (swapButton) {
        swapButton.addEventListener("click", swapColors);
    }

    // Set up plugin message handler
    window.onmessage = handleMessage;
});

dragElement(document.getElementById("plugin"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}