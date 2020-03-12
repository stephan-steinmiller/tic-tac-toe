let blue = "#4A7FFF";
let red = "#FF4A7B";

let gameMode = true;
//  false means singleplayer
//  true means local multiplayer

let turn = false;
//  false means x's turn
//  true means y's turn
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
  addBoxListener();
  document.querySelector(".replay-icon").addEventListener("click", resetBoard);
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
    const fillingPlayerSymbol = turn ? 'oCircle' : "xCross"

    if (e.target) {
      //
      let box = e.target
      acuallyFillBox(box)
      if (!gameMode) {
        turnAI();
      }
    } else if (e.classList.contains("box")) {
      //
      let box = e
      acuallyFillBox(box)
    }

    function acuallyFillBox(box) {
      box.children[0].classList.add(fillingPlayerSymbol);
      box.classList.add(turn ? 'o' : "x");
      box.removeEventListener("click", fillBox);
      changeTurn();
    }
  }
}

function turnAI() {
  let $freeBoxes = [...document.querySelectorAll(`.box:not(.x):not(.o)`)];
  let freeBoxesWithID = $freeBoxes.map(value => value.id);

  let $aiCheckedBoxes = [...document.querySelectorAll(turn ? "o" : "x")];
  let $humanCheckedBoxes = [...document.querySelectorAll(turn ? "x" : "o")];

  aiHasNearlyWon = winConditions.some((winCondition, index) => {
    const hasFoundNearlyWinner = winCondition.filter((id) => {
      return $aiCheckedBoxes.includes(id);
    })
    console.log(hasFoundNearlyWinner);
    return hasFoundNearlyWinner;
  });
  console.log(aiHasNearlyWon);

  if (false) {

  } else if (false) {

  } else {
    let randomBox = freeBoxesWithID[Math.floor(Math.random() * freeBoxesWithID.length)];
    fillBox(document.getElementById(randomBox));
  }
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const symbolToSelect = !turn ? 'oCircle' : "xCross"
  $onTurn = document.querySelector(`.turn-indicator-box .${symbolToSelect}`);
  $onTurn.parentNode.classList.toggle("on-turn");

  if (clickCounter<=5 && clickCounter !== -1) {
    checkWinConditions();
  }
  turn = !turn;
}

function checkWinConditions() {
  const symbolToCheck = turn ? "o" : "x";
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
    winningTurn = turn;

    winningTurn ? oWinningCounter++ : xWinningCounter++;
    winningCounterToChange = winningTurn ? 'oWonCounter' : "xWonCounter";
    winningCounterNumber = winningTurn ? oWinningCounter : xWinningCounter;
    document.querySelector(`.${winningCounterToChange}`).innerHTML  = winningCounterNumber;

    const $winningLine = document.querySelector('.winning-line')
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
        document.querySelector('.replay-icon').style.color = winningColor;
        document.querySelector('.replay-icon').style.color = winningColor;
        isAnimating = false;
      }, 1000);
    }, 300);
  } else if (!clickCounter) {
    // Draw Condition is true
    showWinScreen();
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "block";
    document.querySelector('.replay-icon').style.color = "black";
  }
}

function showWinScreen() {
  document.querySelector(".turn-indicator-box").style.display = "none";
  document.querySelector(".win-screen").style.display = "flex";
  document.getElementById("grid").style.opacity= "0.5";
  document.querySelector(".replay-icon").classList.toggle("replay-icon-fade-in");
}

function resetBoard() {
  if (isAnimating) {
    setTimeout(() => resetBoard(), 200);
  } else {

    if(hasWon) {
      document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
      document.querySelector(`.winning-line`).classList.toggle(`winning-condition-${winConditionIndex}`);
    }

    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "none";
    document.querySelector(".turn-indicator-box").style.display = "flex";
    document.querySelector(".win-screen").style.display = "none";
    document.querySelector(".replay-icon").classList.toggle("replay-icon-fade-in");
    document.getElementById("grid").style.opacity= "1";

    // removing all x and o's out of the boxes
    [...document.querySelectorAll(".box.x")].forEach(box => box.classList.toggle("x"));
    [...document.querySelectorAll(".box.o")].forEach(box => box.classList.toggle("o"));
    [...document.querySelectorAll(".box > .xCross")].forEach(box => box.classList.toggle("xCross"));
    [...document.querySelectorAll(".box > .oCircle")].forEach(box => box.classList.toggle("oCircle"));

    beginningTurn = !beginningTurn;
    turn = beginningTurn;
    clickCounter = 9;
    hasWon = false;
    winConditionIndex = null;
    winningSymbol = null;
    winningTurn = null;
    addBoxListener();
    if (!gameMode && aiSymbol == turn) {
      turnAI();
    }
  }
}
