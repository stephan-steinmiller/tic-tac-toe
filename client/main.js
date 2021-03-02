const GAME_MODES = {
  SINGLEPLAYER: 'singleplayer',
  LOCAL_MULTIPLAYER: 'localMultiplayer',
  ONLINE_MULTIPLAYER: 'onlineMultiplayer',
}

let gameSocket = null;
let myTurn = null;

let blueColor = "#4A7FFF";
let redColor = "#FF4A7B";
let darkGrey = "#505050";

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
let oWinningTurn = null;
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
  console.log(socket);

  const playerName = localStorage.getItem('playerName') || 'Player-' + uuidv4()
  localStorage.setItem('playerName', playerName)
  socket.emit('registered', playerName)
  

  socket.on('match-created', sign => {
      console.log(sign);

    // hideSignSelection()
    
    console.log("sign is x"+ sign == ('x' ? `xPlayer` : 'oPlayer'));

    if (sign == 'x') {
      // if client is xPlayer,
      // do first move
      myTurn = true;
      document.querySelector('.unclickable-overlay').style.display = "none"
    } else if (sign == 'o') {
      // if client is oPlayer,
      // await first move
      myTurn = false;
      document.querySelector('.unclickable-overlay').style.display = "block"
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

function handleMenuButton(value) {
  let lastGameMode = gameMode;
  switch (value) {
    case GAME_MODES.SINGLEPLAYER:
      gameMode = GAME_MODES.SINGLEPLAYER;
      // showSignSelection()
      break;
    case GAME_MODES.LOCAL_MULTIPLAYER:
      gameMode = GAME_MODES.LOCAL_MULTIPLAYER;
      break;
    case GAME_MODES.ONLINE_MULTIPLAYER:
      gameMode = GAME_MODES.ONLINE_MULTIPLAYER;
      document.querySelector('.unclickable-overlay').style.display = "block"
      startOnlineMultiplayer();
      // showSignSelection()
      break;
  }
  if (clickCounter === 9) {
    addBoxListener();
  } else if (lastGameMode !== gameMode) {
    oTurn = false;
    xWinningCounter = 0;
    oWinningCounter = 0;
    document.querySelector(`.x-win-counter`).innerHTML = xWinningCounter;
    document.querySelector(`.o-win-counter`).innerHTML = oWinningCounter;
    resetBoard();
  }
  unShowGameMenu();
}

function showGameMenu() {
  document.querySelector('.game-menu').style.display = "flex";
  let $backButton = document.querySelector('.back-button');
  $backButton.removeEventListener("click", showGameMenu);
}
function unShowGameMenu() {
  document.querySelector('.game-menu').style.display = "none";
  let $backButton = document.querySelector('.back-button');
  $backButton.addEventListener("click", showGameMenu);
}

function showSignSelection() {
  document.querySelector('.wrapper').style.display = "none";
  document.querySelector('.turn-indicator').style.display = "none";
  document.querySelector(".sign-selection").style.display = "block";
  let selectSignButtons = [...document.querySelectorAll(".sign-select-button")]
  selectSignButtons.forEach((button) => {
    button.addEventListener("click", requestSign);
  });
}
function hideSignSelection() {
  document.querySelector('.wrapper').style.display = "flex";
  document.querySelector('.turn-indicator').style.display = "flex";
  document.querySelector(".sign-selection").style.display = "none";
  let selectSignButtons = [...document.querySelectorAll(".sign-select-button")]
  selectSignButtons.forEach((button) => {
    button.removeEventListener("click", requestSign);
    button.style.display = "flex";
  });
}
function requestSign (e) {
  if ([...e.target.classList].indexOf("x-sign")> -1) {
    console.log("x selected");
    if (gameMode === GAME_MODES.SINGLEPLAYER) {
      
    }
    document.querySelector('.sign-select-button.o-sign').style.display = "none";
  } else if ([...e.target.classList].indexOf("o-sign")> -1) {
    console.log("x selected");
    if (gameMode === GAME_MODES.SINGLEPLAYER) {
      
    } else if (gameMode === GAME_MODES.ONLINE_MULTIPLAYER) {
      gameSocket.emit('request-o-sign')
    }
    document.querySelector('.sign-select-button.x-sign').style.display = "none";
  }
  let selectSignButtons = [...document.querySelectorAll(".sign-select-button")]
  selectSignButtons.forEach((button) => {
    button.removeEventListener("click", requestSign);
  });
}

function addBoxListener() {
  // document.getElementById('grid').classList.add(oTurn ? 'o-on-turn' : 'x-on-turn')
  let $boxes = document.querySelectorAll('.box');
  const boxList = [...$boxes]
  boxList.forEach((box) => {
    box.removeEventListener("click", fillBoxByTarget)
    box.addEventListener("click", fillBoxByTarget)
  });
}

function fillBoxByTarget (e) {
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
    if (gameMode == GAME_MODES.SINGLEPLAYER && clickCounter > 0 && !hasWon) {
      turnAI();
    }
  }
}

function fillBoxByID (id) {
  clickCounter--;

  let box = document.getElementById(id);

  box.classList.add(oTurn ? 'o-nought' : "x-cross");
  box.removeEventListener("click", fillBoxByTarget);
  changeTurn();
}

function turnAI() {
  document.querySelector('.unclickable-overlay').style.display = "block"
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
        if (aiCheckedBoxes.includes(id)) {matchingBoxesToWin++}
        if (freeBoxesWithID.includes(id)) {hasFreeBox = true; freeBoxAiCloseToWinID = id}
      })
      let foundNearlyWonIndex = (matchingBoxesToWin == 2 && hasFreeBox == true);
      if (foundNearlyWonIndex) {
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
        if (humanCheckedBoxes.includes(id)) {matchingBoxesToWin++}
        if (freeBoxesWithID.includes(id)) {hasFreeBox = true; freeBoxHumanCloseToWinID = id}
      })
      let foundNearlyWonIndex = (matchingBoxesToWin == 2 && hasFreeBox == true);
      if (foundNearlyWonIndex) {
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
  document.querySelector('.unclickable-overlay').style.display = "none"
}

function changeTurn() {
  let $onTurn = document.querySelector(".on-turn");
  $onTurn.classList.toggle("on-turn");
  const turnToToggle = (!oTurn ? 'o-turn' : "x-turn")
  $onTurn = document.querySelector(`.turn-indicator .${turnToToggle}`);
  $onTurn.classList.toggle("on-turn");

  if (clickCounter<=5 && clickCounter >= 0) {
    checkWinConditions();
  }
  oTurn = !oTurn;
  // document.getElementById('grid').classList.remove(oTurn ? 'x-on-turn' : 'o-on-turn')
  // document.getElementById('grid').classList.add(oTurn ? 'o-on-turn' : 'x-on-turn')
}

function checkWinConditions() {
  const symbolToCheck = (oTurn ? "o-nought" : "x-cross");
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
    oWinningTurn = oTurn;

    oWinningTurn ? oWinningCounter++ : xWinningCounter++;
    winningCounterToChange = (oWinningTurn ? 'o-win-counter' : 'x-win-counter');
    winningCounterNumber = (oWinningTurn ? oWinningCounter : xWinningCounter);
    document.querySelector(`.${winningCounterToChange}`).innerHTML  = winningCounterNumber;

    let $winningLine = document.querySelector(`.winning-line.condition-${winConditionIndex}`)
    $winningLine.classList.toggle(`winning-condition-${winConditionIndex}-starting-point`);

    winningSymbol = (oWinningTurn ? 'o-nought' : "x-cross");
    const winningColor = (oWinningTurn ? redColor : blueColor);
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
    document.querySelector('.play-again-icon').style.color = darkGrey;
  }
}

function showWinScreen() {
  document.querySelector("#grid").classList.add('blur');
  document.querySelector(".on-turn").classList.add('color');
  document.querySelector(".column").classList.add('reverse');
  document.querySelector(".turn-indicator").classList.add("show-box");
  document.querySelector(".win-screen").style.display = "flex";
  document.getElementById("grid").style.opacity= "0.5";
  document.querySelector(".play-again-icon").classList.toggle("play-again-icon-fade-in");
  document.querySelector(".play-again-icon").addEventListener("click", resetBoard);
}

function resetBoard() {
  if (isAnimating) {
    setTimeout(() => resetBoard(), 200);
  } else {

    if (hasWon) {
      document.querySelector(`.win-screen .white-box > div.${winningSymbol}`).classList.remove("show-winner-symbol");
      document.querySelector(`.winning-condition-${winConditionIndex}`).classList.remove(`winning-condition-${winConditionIndex}`);
    }

    //  unset win Screen
    document.querySelector("#grid").classList.remove('blur');
    document.querySelector(".on-turn").classList.remove('color');
    document.querySelector(".column").classList.remove('reverse');
    document.querySelector(".turn-indicator").classList.remove('show-box');
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
    oWinningTurn = null;

    addBoxListener();
    if (gameMode === GAME_MODES.SINGLEPLAYER && aiSymbol == beginningTurn) {
      turnAI();
    }
  }
}
