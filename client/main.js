let blue = "#4A7FFF";
let red = "#FF4A7B";

let gameMode = "singleplayer";

let oTurn = false;
//  false means x's turn
//  true means o's turn
let aiSymbol = true;
let beginningTurn = false;
let clickCounter = 9;
let hasWon = false;

let winConditionIndex = null;
let winningSymbol = null;
let winningTurn = null;
let isAnimating = false;
let xWinningCounter = 0;
let oWinningCounter = 0;

const winConditions = [
  // horizontal win conditions
  ["a1","a2","a3"],
  ["b1","b2","b3"],
  ["c1","c2","c3"],
  // vertical win conditions
  ["a1","b1","c1"],
  ["a2","b2","c2"],
  ["a3","b3","c3"],
  // diagonal win conditions
  ["a1","b2","c3"],
  ["a3","b2","c1"],
];


window.onload = function () {
  /*console.log(window.connect);

  window.connect()
  window.gameSocket.on('set-field', () => {
    // your custom code to set a field
  })

  window.gameSocket.emit('set-field', '{field: 1}')*/

  addBoxListener();
  document.querySelector(".play-again-icon").addEventListener("click", resetBoard);
}

function addBoxListener() {
  let $boxes = document.getElementsByClassName('box');
  const boxList = [...$boxes]
  boxList.forEach((box) => {
    box.removeEventListener("click", fillBox)
    box.addEventListener("click", fillBox)
  });
}

function fillBox(e) {
  if (!hasWon) {
    clickCounter--;
    const fillingPlayerSymbol = oTurn ? 'oCircle' : "xCross"

    if (e.target) {
      //
      let box = e.target
      acuallyFillBox(box)
      if (gameMode == "singleplayer" && clickCounter > 0) {
        turnAI();
      }
    } else if (e.classList.contains("box")) {
      //
      let box = e
      acuallyFillBox(box)
    }

    function acuallyFillBox(box) {
      box.children[0].classList.add(fillingPlayerSymbol);
      box.classList.add(oTurn ? 'o' : "x");
      box.removeEventListener("click", fillBox);
      changeTurn();
    }
  }
}

function turnAI() {
  let freeBoxesWithID = [...document.querySelectorAll(`.box:not(.x):not(.o)`)].map(value => value.id);

  let aiCheckedBoxes = [...document.querySelectorAll(aiSymbol ? ".o" : ".x")].map( value => value.id);
  let humanCheckedBoxes = [...document.querySelectorAll(aiSymbol ? ".x" : ".o")].map( value => value.id);

  let matchingBoxesToWin = 0;
  let hasFreeBox = false;
  let freeBoxAiCloseToWinID = null;
  let freeBoxHumanCloseToWinID = null;

  aiHasAlmostWon = winConditions.some((winCondition, index) => {
    winCondition.forEach((id) => {
      if(aiCheckedBoxes.includes(id)) {matchingBoxesToWin++}
      if(freeBoxesWithID.includes(id)) {hasFreeBox = true; freeBoxAiCloseToWinID = id}
    })
    let foundNearlyWonIndex = (matchingBoxesToWin == 2 && hasFreeBox == true);
    if(foundNearlyWonIndex) {
      let aiCloseToWinIndex = index;
    } else {
      matchingBoxesToWin = 0;
      hasFreeBox = false;
      freeBoxAiCloseToWinID = null;
    }
    return foundNearlyWonIndex
  });

  humanHasAlmostWon = winConditions.some((winCondition, index) => {
    winCondition.forEach((id) => {
      if(humanCheckedBoxes.includes(id)) {matchingBoxesToWin++}
      if(freeBoxesWithID.includes(id)) {hasFreeBox = true; freeBoxHumanCloseToWinID = id}
    })
    let foundNearlyWonIndex = (matchingBoxesToWin == 2 && hasFreeBox == true);
    if(foundNearlyWonIndex) {
      let humanCloseToWinIndex = index;
    } else {
      matchingBoxesToWin = 0;
      hasFreeBox = false;
      freeBoxHumanCloseToWinID = null;
    }
    return foundNearlyWonIndex
  });


  if (aiHasAlmostWon) {
    fillBox(document.getElementById(freeBoxAiCloseToWinID));
  } else if (humanHasAlmostWon) {
    fillBox(document.getElementById(freeBoxHumanCloseToWinID));
  } else {
    let randomBox = freeBoxesWithID[Math.floor(Math.random() * freeBoxesWithID.length)];
    fillBox(document.getElementById(randomBox));
  }
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const symbolToSelect = !oTurn ? 'oCircle' : "xCross"
  $onTurn = document.querySelector(`.turn-indicator-box .${symbolToSelect}`);
  $onTurn.parentNode.classList.toggle("on-turn");

  if (clickCounter<=5 && clickCounter >= 0) {
    checkWinConditions();
  }
  oTurn = !oTurn;
}

function checkWinConditions() {
  const symbolToCheck = oTurn ? "o" : "x";
  // finding all boxes with the current Symbol
  let $boxes = [...document.querySelectorAll(`.box.${symbolToCheck}`)];
  // puting the ID's into an Array
  let filledPlayerBoxes = $boxes.map( value => value.id)
  //
  hasWon = winConditions.some((winCondition, index) => {
    const hasFoundWinner = winCondition.every((id) => {
      return filledPlayerBoxes.includes(id);
    })
    if (hasFoundWinner) {
      winConditionIndex = index;
    }
    return hasFoundWinner;
  });
  if (hasWon) {
    // Win Condition is true
    winningTurn = oTurn;

    winningTurn ? oWinningCounter++ : xWinningCounter++;
    winningCounterToChange = winningTurn ? 'oWinCounter' : "xWinCounter";
    winningCounterNumber = winningTurn ? oWinningCounter : xWinningCounter;
    document.querySelector(`.${winningCounterToChange}`).innerHTML  = winningCounterNumber;

    let $winningLine = document.querySelector(`.condition-${winConditionIndex}`)
    console.log($winningLine);
    console.log(document.querySelector(`.winning-line`));
    $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);

    winningSymbol = winningTurn ? 'oCircle' : "xCross";
    const winningColor = winningTurn ? red : blue;
    isAnimating = true;

    setTimeout(() => {
      $winningLine.classList.toggle(`winning-condition-${winConditionIndex}`);
      $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);
      $winningLine.style.color = winningColor;

      setTimeout(() => {
        showWinScreen();
        document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
        document.querySelector(".won-text").style.color = winningColor;
        document.querySelector('.play-again-icon').style.color = winningColor;
        isAnimating = false;
      }, 1000);
    }, 300);
  } else if (!clickCounter) {
    // Draw Condition is true
    showWinScreen();
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "block";
    document.querySelector('.play-again-icon').style.color = "black";
  }
}

function showWinScreen() {
  document.querySelector(".turn-indicator-box").style.display = "none";
  document.querySelector(".win-screen").style.display = "flex";
  document.getElementById("grid").style.opacity= "0.5";
  document.querySelector(".play-again-icon").classList.toggle("play-again-icon-fade-in");
}

function resetBoard() {
  if (isAnimating) {
    setTimeout(() => resetBoard(), 200);
  } else {

    if(hasWon) {
      document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
      document.querySelector(`.condition-${winConditionIndex}`).classList.toggle(`winning-condition-${winConditionIndex}`);
    }

    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "none";
    document.querySelector(".turn-indicator-box").style.display = "flex";
    document.querySelector(".win-screen").style.display = "none";
    document.querySelector(".play-again-icon").classList.toggle("play-again-icon-fade-in");
    document.getElementById("grid").style.opacity= "1";

    // removing all x and o's out of the boxes
    [...document.querySelectorAll(".box.x")].forEach(box => box.classList.toggle("x"));
    [...document.querySelectorAll(".box.o")].forEach(box => box.classList.toggle("o"));
    [...document.querySelectorAll(".box > .xCross")].forEach(box => box.classList.toggle("xCross"));
    [...document.querySelectorAll(".box > .oCircle")].forEach(box => box.classList.toggle("oCircle"));

    beginningTurn = !beginningTurn;
    oTurn = beginningTurn;
    clickCounter = 9;
    hasWon = false;
    winConditionIndex = null;
    winningSymbol = null;
    winningTurn = null;

    addBoxListener();
    if (gameMode == "singleplayer" && aiSymbol == beginningTurn) {
      turnAI();
    }
  }
}
