window.connect = () => {
    const socket = io('http://localhost:3000')
    const playerUserId = Date.now()
    const playerName = localStorage.getItem('playerName') 
                        || 'Player'+ playerUserId

    localStorage.setItem('playerName', playerName)

    
  socket.on('match-created', matchObject => {
    console.log(matchObject.xPlayer);
    window.firstMove = (matchObject.xPlayer == playerName) ? true : false;
    //const match = JSON.parse(matchString)
    //'{matchName:"match1", Player123123213Symbol:"x",Player43243434Symbol:"o"}'
    //window.match = match
  })
    
    socket.emit('register-player', playerName)

    window.gameSocket = socket
}