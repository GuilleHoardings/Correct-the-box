document.addEventListener("mousedown", function (event) {
    mousedown = true
    if (boxToShow != "editable") return

    var mousePos_ = getMousePos(canvas, event)
    var mousePos = new Point(mousePos_.x, mousePos_.y)
    selectedCornerIndex = getClickedCornerIndex(mousePos, cornersDistorted, cornerMovementRestrictions)


});


document.addEventListener("mousemove", function (event) {

    var mousePos_ = getMousePos(canvas, event)
    var mousePos = new Point(mousePos_.x, mousePos_.y)

    if (mousedown && selectedCornerIndex != null) {
        selectedCornerRestriction = cornerMovementRestrictions[selectedCornerIndex]
        if (selectedCornerRestriction == -1) {
            // Allowed to move corner freely
            cornersDistorted[selectedCornerIndex] = mousePos
        } else {
            // Calculate new corner so that it has the smallest distance to the cursor
            // but is still allowed
            cornersDistorted[selectedCornerIndex] = getClosestPointOfLine(cornersDistorted[selectedCornerRestriction], cornersDistorted[selectedCornerIndex], mousePos)
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawABox(cornersDistorted, cornerMovementRestrictions, showLinesValue)
    }

});


document.addEventListener("mouseup", function (event) {
    mousedown = false
    selectedCornerIndex = null
});


function swapSettingsVPsButtonValue() {
    switch (settingsVPsButton.innerHTML) {
        case "near": settingsVPsButton.innerHTML = "medium"; break;
        case "medium": settingsVPsButton.innerHTML = "far"; break;
        case "far": settingsVPsButton.innerHTML = "mixed"; break;
        case "mixed": settingsVPsButton.innerHTML = "near"; break;
    }
    setSettingsValues()
}


function swapSettingsDistortionButtonValue() {
    switch (settingsDistortionButton.innerHTML) {
        case "small": settingsDistortionButton.innerHTML = "medium"; break;
        case "medium": settingsDistortionButton.innerHTML = "huge"; break;
        case "huge": settingsDistortionButton.innerHTML = "mixed"; break;
        case "mixed": settingsDistortionButton.innerHTML = "small"; break;
    }
    setSettingsValues()
}


function swapSettingsBoxesButtonValue() {
    switch (settingsBoxesButton.innerHTML) {
        case "small": settingsBoxesButton.innerHTML = "medium"; break;
        case "medium": settingsBoxesButton.innerHTML = "huge"; break;
        case "huge": settingsBoxesButton.innerHTML = "mixed"; break;
        case "mixed": settingsBoxesButton.innerHTML = "small"; break;
    }
    setSettingsValues()
}


// Settings
var VPsMinDistance = 0
var VPsMaxDistance = 0
var minDistortion = 0
var maxDistortion = 0
var minInitialYLength = 0
var maxInitialYLength = 0
var showLinesValue = false


// Array initialization
var cornersCorrect = []
var cornerMovementRestrictions = []
var cornersDistorted = []
var vanishingPoints = []
var initialBox = []
var lastCheckBoxes = []
var currentLastCheckBox = 0
var lastCheckBoxesMaxLength = 50

// Get Buttons
var settingsVPsButton = document.getElementById("settingsVPsButton") // near, far, mixed
var settingsDistortionButton = document.getElementById("settingsDistortionButton") // small, huge, mixed
var settingsBoxesButton = document.getElementById("settingsBoxesButton") // small, huge, mixed
var showEditableBoxButton = document.getElementById("showEditableBoxButton")
var showSolutionButton = document.getElementById("showSolutionButton")
var showInitialBoxButton = document.getElementById("showInitialBoxButton")
var showAtLastCheckButton = document.getElementById("showAtLastCheckButton")
var checkBoxButton = document.getElementById("checkBoxButton")
// score text
var scoreLinesText = document.getElementById("scoreLinesText")
var scoreCornersText = document.getElementById("scoreCornersText")
// variables to generate a text message along with the score
var initialScoreLines = null
var lastScoreLines = null
// whether to show the editable box, the solution or the initial box
var boxToShow = null // "initial"; "solution"; "editable"; "lastCheck"

function setDefaultSettings() {
    settingsVPsButton.innerHTML = "medium"
    settingsDistortionButton.innerHTML = "medium"
    settingsBoxesButton.innerHTML = "medium"
}

function setSettingsValues() {
    switch (settingsVPsButton.innerHTML) {
        case "near": VPsMinDistance = 70; VPsMaxDistance = 250; break;
        case "medium": VPsMinDistance = 400; VPsMaxDistance = 650; break;
        case "far": VPsMinDistance = 1000; VPsMaxDistance = 6000; break;
        case "mixed": VPsMinDistance = 5; VPsMaxDistance = 1500; break;
    }

    switch (settingsDistortionButton.innerHTML) {
        case "small": minDistortion = 0; maxDistortion = 20; break;
        case "medium": minDistortion = 5; maxDistortion = 35; break;
        case "huge": minDistortion = 40; maxDistortion = 100; break;
        case "mixed": minDistortion = 0; maxDistortion = 60; break;
    }

    switch (settingsBoxesButton.innerHTML) {
        case "small": minInitialYLength = 30; maxInitialYLength = 200; break;
        case "medium": minInitialYLength = 200; maxInitialYLength = 280; break;
        case "huge": minInitialYLength = 300; maxInitialYLength = 500; break;
        case "mixed": minInitialYLength = 30; maxInitialYLength = 500; break;
    }
}


// Add the distances of lines to the VPs they should hit together
function checkBox() {

    var scoreLines = getBoxScoreLines();
    var scoreCorners = "Corner score: " + Math.floor(getBoxScoreCorners() * 100);

    // Add box to history
    lastCheckBoxes.unshift(cornersDistorted.slice())
    if (lastCheckBoxes.length > lastCheckBoxesMaxLength) lastCheckBoxes.pop()
    var str1 = ""
    var str2 = "Since last check: "
    // Show the general score
    scoreLinesText.innerHTML = "Off by " + Math.floor(scoreLines)
    // Get a message along with the score
    if (scoreLines > initialScoreLines && scoreLines > 5000) {
        str1 = "That is ... a really big number."
    } else if (scoreLines > initialScoreLines) {
        str1 = "Worse than at the start."
    } else if (scoreLines == initialScoreLines) {
        str1 = "Exactly where you started."
    } else if (scoreLines < 0) {
        str1 = "You are so good, you destroyed math."
    } else if (scoreLines == 0) {
        str1 = "Impossible!"
    } else if (scoreLines <= 10) {
        str1 = "Top 10! (You can stop now)."
    } else if (scoreLines <= 25) {
        str1 = "That is really really good!"
    } else if (scoreLines < 50) {
        str1 = "That is really good!"
    } else if (scoreLines < 100) {
        str1 = "That is good!"
    } else if (scoreLines < 200) {
        str1 = "That is ok!"
    } else if (scoreLines < 400) {
        str1 = "Still work to do."
    } else if (scoreLines < 1000) {
        str1 = "You can do better!"
    } else {
        str1 = "Better than before!"
    }

    if (scoreLines < lastScoreLines * 0.25) {
        str2 += "Really really big improvement!"
    } else if (scoreLines < lastScoreLines * 0.5) {
        str2 += "Twice as good!"
    } else if (scoreLines < lastScoreLines * 0.75) {
        str2 += "Big improvement!"
    } else if (scoreLines < lastScoreLines) {
        str2 += "Improved"
    } else if (scoreLines == lastScoreLines) {
        str2 += "Exactly the same"
    } else if (scoreLines > lastScoreLines * 4) {
        str2 += "Seriously worsened"
    } else if (scoreLines > lastScoreLines * 2) {
        str2 += "Twice as bad"
    } else {
        str2 += "Worsened"
    }

    scoreCornersText.innerHTML = str1 + "<br>" + str2 + "<br>" + scoreCorners
    lastScoreLines = scoreLines
}

function getBoxScoreLines() {
    var totalDistance = 0
    totalDistance += getDistanceOfPointToLine(cornersDistorted[0], cornersDistorted[1], vanishingPoints[0])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[0], cornersDistorted[2], vanishingPoints[1])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[0], cornersDistorted[3], vanishingPoints[2])

    totalDistance += getDistanceOfPointToLine(cornersDistorted[1], cornersDistorted[4], vanishingPoints[1])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[2], cornersDistorted[4], vanishingPoints[0])

    totalDistance += getDistanceOfPointToLine(cornersDistorted[1], cornersDistorted[5], vanishingPoints[2])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[3], cornersDistorted[5], vanishingPoints[0])

    totalDistance += getDistanceOfPointToLine(cornersDistorted[2], cornersDistorted[6], vanishingPoints[2])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[3], cornersDistorted[6], vanishingPoints[1])

    totalDistance += getDistanceOfPointToLine(cornersDistorted[4], cornersDistorted[7], vanishingPoints[2])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[5], cornersDistorted[7], vanishingPoints[1])
    totalDistance += getDistanceOfPointToLine(cornersDistorted[6], cornersDistorted[7], vanishingPoints[0])

    return totalDistance
}

function getBoxScoreCorners() {
    var totalDistance = 0

    for (var i = 4; i < 8; i++) {
        totalDistance += cornersDistorted[i].distance(cornersCorrect[i]);
        console.log(i, cornersDistorted[i], cornersCorrect[i], cornersDistorted[i].distance(cornersCorrect[i]))
    }

    return totalDistance
}

// swap the box to display when "lastCheck" is selected
document.addEventListener('keydown', function (event) {
    const key = event.key;
    if ((key == "a" || key == "ArrowLeft") && boxToShow == "lastCheck" && currentLastCheckBox < lastCheckBoxes.length - 1) currentLastCheckBox += 1
    else if ((key == "d" || key == "ArrowRight") && boxToShow == "lastCheck" && currentLastCheckBox > 0) currentLastCheckBox -= 1
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    displayBox()
});

function showLines() {
    showLinesValue = !showLinesValue
    displayBox()
}

function showSolution() {
    boxToShow = "solution"
    showEditableBoxButton.className = "buttonNotSelected"
    showSolutionButton.className = "buttonSelected"
    showInitialBoxButton.className = "buttonNotSelected"
    showAtLastCheckButton.className = "buttonNotSelected"
    checkBoxButton.disabled = true
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    displayBox()
}

function showEditableBox() {
    boxToShow = "editable"
    showEditableBoxButton.className = "buttonSelected"
    showSolutionButton.className = "buttonNotSelected"
    showInitialBoxButton.className = "buttonNotSelected"
    showAtLastCheckButton.className = "buttonNotSelected"
    checkBoxButton.disabled = false
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    displayBox()
}

function showInitialBox() {
    boxToShow = "initial"
    showEditableBoxButton.className = "buttonNotSelected"
    showSolutionButton.className = "buttonNotSelected"
    showInitialBoxButton.className = "buttonSelected"
    showAtLastCheckButton.className = "buttonNotSelected"
    checkBoxButton.disabled = true
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    displayBox()
}

function showAtLastCheck() {
    boxToShow = "lastCheck"
    showEditableBoxButton.className = "buttonNotSelected"
    showSolutionButton.className = "buttonNotSelected"
    showInitialBoxButton.className = "buttonNotSelected"
    showAtLastCheckButton.className = "buttonSelected"
    checkBoxButton.disabled = true
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    displayBox()
}


// Display the box that should be displayed
function displayBox() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (boxToShow == "editable") {
        drawABox(cornersDistorted, cornerMovementRestrictions, showLinesValue)
    } else if (boxToShow == "initial") {
        drawABox(initialBox, cornerMovementRestrictions, showLinesValue)
    } else if (boxToShow == "solution") {
        drawABox(cornersCorrect, cornerMovementRestrictions, showLinesValue)
    } else {
        drawABox(lastCheckBoxes[currentLastCheckBox], cornerMovementRestrictions, showLinesValue)
    }
}

function newBox() {
    showLinesValue = false;
    checkBoxButton.disabled = true;
    // "canvas" var should be known here
    [cornersCorrect, cornersDistorted, cornerMovementRestrictions, vanishingPoints] = getBoxCorners(
        new Point(canvas.width / 2, canvas.height / 2),
        minInitialYLength, maxInitialYLength, VPsMinDistance, VPsMaxDistance, minDistortion, maxDistortion)

    initialScoreLines = getBoxScoreLines()
    initialBox = cornersDistorted.slice()
    lastCheckBoxes = [cornersDistorted.slice()]
    currentLastCheckBox = 0
    showAtLastCheckButton.innerHTML = "show [" + (currentLastCheckBox + 1) + "] check earlier (use [a] / [d])"
    lastScoreLines = initialScoreLines

    showEditableBox()
}

function init() {
    setDefaultSettings()
    setSettingsValues()
    newBox()
}

init()
