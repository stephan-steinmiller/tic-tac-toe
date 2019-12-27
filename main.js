let turn = false;
let clickCounter = 9;
let hasWon = false;
let winConditionIndex = null;
let winningSymbol = null;
let winningTurn = null;
let isAnimating = false

const winConditions = [
  //horizontal win conditions
  ["a1","a2","a3"],
  ["b1","b2","b3"],
  ["c1","c2","c3"],
  //vertical win conditions
  ["a1","b1","c1"],
  ["a2","b2","c2"],
  ["a3","b3","c3"],
  //diagonal win conditions
  ["a1","b2","c3"],
  ["a3","b2","c1"],
];

window.onload = function () {
  let $boxes = document.getElementsByClassName('box');

  const boxList = [...$boxes]
  boxList.forEach((box) => {
    box.addEventListener("click", fillBox, {once: true})
  });

}

function fillBox(e) {
  clickCounter--;
  if (e.target.classList.contains("box") && !hasWon) {
    const playerSymbol = turn ? 'oCircle' : "xCross"
    e.target.children[0].classList.add(playerSymbol);
    e.target.classList.add(turn ? 'o' : "x")
    changeTurn();
  }
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const symbolToSelect = !turn ? 'oCircle' : "xCross"
  $onTurn = document.querySelector(`.turn-indicator-box .${symbolToSelect}`);
  $onTurn.parentNode.classList.toggle("on-turn");
  if (clickCounter<=5) {
    checkWinConditions(symbolToSelect);
  };
  turn = !turn;
};

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
    //Win Condition is true
    document.querySelector(`.winning-line`).classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);

    winningTurn = turn
    winningSymbol = winningTurn ? 'oCircle' : "xCross"
    isAnimating = true
    setTimeout(() => {
      document.querySelector(`.winning-line`).classList.toggle(`winning-condition-${winConditionIndex}`);
      document.querySelector(`.winning-line`).classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);
      setTimeout(() => {
        showWinScreen()
        document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
        document.querySelector(`.win-screen .white-box > div.won-text`).classList.toggle(winningTurn ? "red-text" : "blue-text");
        console.log(winningSymbol);
        isAnimating = false
      }, 1000);
    }, 300);

  } else if (!clickCounter) {
    //Draw Condition is true
    showWinScreen()
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "block";
  }
};

function showWinScreen() {
  document.querySelector(".turn-indicator-box").style.display = "none";
  document.querySelector(".win-screen").style.display = "flex";
  document.getElementById("grid").style.opacity= "0.5";
  document.querySelector(".replay-icon").classList.toggle("replay-icon-fade-in");
}

function resetBoard(winningSymbol, winningTurn) {
  if (isAnimating) {
    setTimeout(() => {
      resetBoard(winningSymbol, winningTurn)
    }, 200);
  } else {
    document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
    document.querySelector(`.win-screen .white-box > div.won-text`).classList.toggle(winningSymbol ? "red-text" : "blue-text");
    document.querySelector(".turn-indicator-box").style.display = "flex";
    document.querySelector(".win-screen").style.display = "none";
    document.querySelector(".white-box").style.display = "none";
    document.querySelector(".replay-icon").classList.toggle("replay-icon-fade-in");
    document.getElementById("grid").style.opacity= "1";
    document.querySelector(`.winning-line`).classList.toggle(`winning-condition-${winConditionIndex}`);
    if(winningTurn) {
      changeTurn()
    }
    clickCounter = 9;
    hasWon = false;
    winConditionIndex = null;
    winningSymbol = null;
    winningTurn = null;
  }
}
