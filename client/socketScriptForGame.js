window.connect = () => {
    const socket = io('http://localhost:3000')
    const playerUserId = Date.now()
    const playerName = localStorage.getItem('playerName') 
                        || 'Player'+ playerUserId

    localStorage.setItem('playerName', playerName)

    socket.on('chat-message', data => {
        console.log(data);
    })

    socket.emit('register-player', playerName)
    socket.emit('chat-message', playerName)

    socket.on('match-created', matchString => {
        const match = JSON.parse(matchString)
        //'{matchName:"match1", Player123123213Symbol:"x",Player43243434Symbol:"o"}'
        window.match = match
    })
    window.gameSocket = socket
}