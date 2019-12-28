let blue = "#4A7FFF";
let red = "#FF4A7B";

let turn = false;
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
  clickCounter--;
  if (e.target.classList.contains("box") && !hasWon) {
    const playerSymbol = turn ? 'oCircle' : "xCross"
    e.target.children[0].classList.add(playerSymbol);
    e.target.classList.add(turn ? 'o' : "x")
    e.target.removeEventListener("click", fillBox)

    changeTurn();
  }
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const symbolToSelect = !turn ? 'oCircle' : "xCross"
  $onTurn = document.querySelector(`.turn-indicator-box .${symbolToSelect}`);
  $onTurn.parentNode.classList.toggle("on-turn");

  if (clickCounter<=5 && clickCounter !== -1) {
    checkWinConditions(symbolToSelect);
  }
  turn = !turn;
}

function checkWinConditions(symbolToSelect) {
  const symbolToCheck = turn ? "o" : "x";
  let $boxes = [...document.querySelectorAll(`.box.${symbolToCheck}`)];
  let filledPlayerBoxes = $boxes.map(function(value) {
    return value.id;
  })
  hasWon = winConditions.some((winCondition, index) => {
    const hasFoundWinner = winCondition.every((id) => {
      return filledPlayerBoxes.includes(id);
    })
    if (hasFoundWinner) {
      winConditionIndex = index
    }
    return hasFoundWinner;
  });
  if (hasWon) {
    // Win Condition is true
    const $winningLine = document.querySelector('.winning-line')
    $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);

    winningTurn = turn
    winningSymbol = winningTurn ? 'oCircle' : "xCross"
    const winningColor = winningTurn ? red : blue
    isAnimating = true

    setTimeout(() => {
      $winningLine.classList.toggle(`winning-condition-${winConditionIndex}`);
      $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);
      $winningLine.style.color = winningColor

      setTimeout(() => {
        showWinScreen()
        document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
        document.querySelector(".won-text").style.color = winningColor
        document.querySelector('.replay-icon').style.color = winningColor
        document.querySelector('.replay-icon').style.color = winningColor
        isAnimating = false
      }, 1000);
    }, 300);
  } else if (!clickCounter) {
    // Draw Condition is true
    showWinScreen()
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "block";
    document.querySelector('.replay-icon').style.color = "black"
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
  }
}
