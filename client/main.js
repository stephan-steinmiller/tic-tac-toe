const GAME_MODES = {
  SINGLEPLAYER: 'singleplayer',
  LOCAL_MULTIPLAYER: 'localMultiplayer',
  ONLINE_MULTIPLAYER: 'onlineMultiplayer',
}

let gameSocket = null;
let myTurn = null;

let blue = "#4A7FFF";
let red = "#FF4A7B";

let gameMode = String();

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

function startOnlineMultiplayer() {
  const socket = io("https://xsnos.herokuapp.com")

  const playerName = localStorage.getItem('playerName') || 'Player-' + uuidv4()
  localStorage.setItem('playerName', playerName)
  socket.emit('registered', playerName)


  socket.on('match-created', sign => {
    
    console.log(sign == 'x' ? `xPlayer` : 'oPlayer' );

    if (sign == 'x') {
      // if client is xPlayer,
      // do first move
      myTurn = true;
      document.querySelector('.unclickable-overlay').style.display = "none"
    } else if (sign == 'o') {
      // if client is oPlayer,
      // await first move
      myTurn = false;
    }
    socket.on('field', (move) => {
      console.log(`got that: ${move}`);
      // your custom code to set a field
      fillBoxByID(move);
      myTurn = true;
      document.querySelector('.unclickable-overlay').style.display = "none"
    })
  });
  gameSocket = socket;
}

window.onload = function () {
  // [...document.getElementsByClassName('menu-button')].forEach((button) => {
  //   console.log(button);
  //   button.addEventListener("click", handleMenuButton(button.classList))
  // });
}

function handleMenuButton(classList) {
  let tmpGameMode = gameMode;
  switch ([...classList].pop()) {
    case GAME_MODES.SINGLEPLAYER:
      gameMode = GAME_MODES.SINGLEPLAYER;
      break;
    case GAME_MODES.LOCAL_MULTIPLAYER:
      gameMode = GAME_MODES.LOCAL_MULTIPLAYER;
      break;
    case GAME_MODES.ONLINE_MULTIPLAYER:
      gameMode = GAME_MODES.ONLINE_MULTIPLAYER;
      document.querySelector('.unclickable-overlay').style.display = "block"
      startOnlineMultiplayer();
      break;
  }
  if (clickCounter === 9) {
    addBoxListener();
  } else if(tmpGameMode !== gameMode) {
    oTurn = false;
    xWinningCounter = 0;
    oWinningCounter = 0;
    document.querySelector(`.x-win-counter`).innerHTML  = xWinningCounter;
    document.querySelector(`.o-win-counter`).innerHTML  = oWinningCounter;
    resetBoard();
  }
  unShowGameMenu();
}

function showGameMenu() {
  document.querySelector('.game-menu').style.display = "flex";
  let $backIcon = document.querySelector('.back-icon');
  $backIcon.removeEventListener("click", showGameMenu)
}
function unShowGameMenu() {
  document.querySelector('.game-menu').style.display = "none";
  let $backIcon = document.querySelector('.back-icon');
  $backIcon.addEventListener("click", showGameMenu)
}



function addBoxListener() {
  let $boxes = document.getElementsByClassName('box');
  const boxList = [...$boxes]
  boxList.forEach((box) => {
    box.removeEventListener("click", fillBoxByTarget)
    box.addEventListener("click", fillBoxByTarget)
  });
}

function fillBoxByTarget(e) {
  if (!hasWon) {
    if (gameMode == GAME_MODES.ONLINE_MULTIPLAYER && myTurn) {
      gameSocket.emit('set-field', e.target.id)

      document.querySelector('.unclickable-overlay').style.display = "block"
      myTurn = !myTurn
    }
    clickCounter--;

    let box = e.target

    box.classList.add(oTurn ? 'o-nought' : "x-cross");
    box.removeEventListener("click", fillBoxByTarget);
    changeTurn();
    if (gameMode == GAME_MODES.SINGLEPLAYER && clickCounter > 0) {
      turnAI();
    }
  }
}

function fillBoxByID(id) {
  clickCounter--;

  let box = document.getElementById(id);

  box.classList.add(oTurn ? 'o-nought' : "x-cross");
  box.removeEventListener("click", fillBoxByTarget);
  changeTurn();
}

function turnAI() {
  let freeBoxesWithID = [...document.querySelectorAll(`.box:not(.x-cross):not(.o-nought)`)].map(value => value.id);

  let aiCheckedBoxes = [...document.querySelectorAll(aiSymbol ? ".o-nought" : ".x-cross")].map( value => value.id);
  let humanCheckedBoxes = [...document.querySelectorAll(aiSymbol ? ".x-cross" : ".o-nought")].map( value => value.id);

  let matchingBoxesToWin = 0;
  let hasFreeBox = false;
  let freeBoxAiCloseToWinID = null;
  let freeBoxHumanCloseToWinID = null;

  let aiHasAlmostWon = function() {
    return winConditions.some((winCondition, index) => {
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
  }

  let humanHasAlmostWon = function() {
    return winConditions.some((winCondition, index) => {
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
  }

  let randomMistake = () => {
    return (Math.floor(Math.random()*10));
  }

  if (randomMistake() && aiHasAlmostWon()) {
    fillBoxByID(freeBoxAiCloseToWinID);
  } else if (randomMistake() && humanHasAlmostWon()) {
    fillBoxByID(freeBoxHumanCloseToWinID);
  } else {
    let randomBox = freeBoxesWithID[Math.floor(Math.random() * freeBoxesWithID.length)];
    fillBoxByID(randomBox);
  }
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const turnToToggle = !oTurn ? 'o-turn' : "x-turn"
  $onTurn = document.querySelector(`.turn-indicator-box .${turnToToggle}`);
  $onTurn.classList.toggle("on-turn");

  if (clickCounter<=5 && clickCounter >= 0) {
    checkWinConditions();
  }
  oTurn = !oTurn;
}

function checkWinConditions() {
  const symbolToCheck = oTurn ? "o-nought" : "x-cross";
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
    winningCounterToChange = winningTurn ? 'o-win-counter' : "x-win-counter";
    winningCounterNumber = winningTurn ? oWinningCounter : xWinningCounter;
    document.querySelector(`.${winningCounterToChange}`).innerHTML  = winningCounterNumber;

    let $winningLine = document.querySelector(`.winning-line.condition-${winConditionIndex}`)
    $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);

    winningSymbol = winningTurn ? 'o-nought' : "x-cross";
    const winningColor = winningTurn ? red : blue;
    isAnimating = true;

    setTimeout(() => {
      $winningLine.style.color = winningColor;
      $winningLine.classList.toggle(`winning-condition-${winConditionIndex}`);

      setTimeout(() => {
        showWinScreen();
        document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.toggle("show-winner-symbol");
        document.querySelector(".won-text").style.color = winningColor;
        document.querySelector('.play-again-icon').style.color = winningColor;
      }, 1000);
    }, 300);
    $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);
    isAnimating = false;
  } else if (!clickCounter) {
    // Draw Condition is true
    showWinScreen();
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "block";
    document.querySelector('.play-again-icon').style.color = "black";
  }
}

function showWinScreen() {
  document.querySelector("#grid").classList.add('blur');
  document.querySelector(".on-turn").classList.add('color');
  document.querySelector(".column").classList.add('reverse');
  document.querySelector(".turn-indicator-box").classList.add("show-container");
  document.querySelector(".win-screen").style.display = "flex";
  document.getElementById("grid").style.opacity= "0.5";
  document.querySelector(".play-again-icon").classList.toggle("play-again-icon-fade-in");
  document.querySelector(".play-again-icon").addEventListener("click", resetBoard);
}

function resetBoard() {
  if (isAnimating) {
    setTimeout(() => resetBoard(), 200);
  } else {

    if(hasWon) {
      document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.remove("show-winner-symbol");
      document.querySelector(`.winning-condition-${winConditionIndex}`).classList.remove(`winning-condition-${winConditionIndex}`);
    }

    //  unset win Screen
    document.querySelector("#grid").classList.remove('blur');
    document.querySelector(".on-turn").classList.remove('color');
    document.querySelector(".column").classList.remove('reverse');
    document.querySelector(".turn-indicator-box").classList.remove('show-container');
    document.querySelector(`.win-screen .white-box > div.draw-text`).style.display = "none";
    document.querySelector(".win-screen").style.display = "none";
    document.querySelector(".play-again-icon").classList.remove("play-again-icon-fade-in");
    document.getElementById("grid").style.opacity= "1";

    // removing all x-cross'es and o-nought's out of the boxes
    [...document.querySelectorAll(".box.x-cross")].forEach(box => box.classList.remove("x-cross"));
    [...document.querySelectorAll(".box.o-nought")].forEach(box => box.classList.remove("o-nought"));

    beginningTurn = !beginningTurn;
    oTurn = beginningTurn;
    clickCounter = 9;
    hasWon = false;
    winConditionIndex = null;
    winningSymbol = null;
    winningTurn = null;

    addBoxListener();
    if (gameMode === GAME_MODES.SINGLEPLAYER && aiSymbol == beginningTurn) {
      turnAI();
    }
  }
}
