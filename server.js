const socketio = require('socket.io')
const express = require('express')
const { GAME_STATES } = require('./serverConstants')
// const io = require('socket.io')(3000)


const app = express()
app.use(express.static(__dirname + '/client'))

const port = process.env.PORT || 3000
const expressServer = app.listen(port)
console.log(`Server listening on port ${port}`)

const io = socketio(expressServer)


const PLAYER_SESSION_TIMEOUT = 5000
let onlinePlayers = {
    // Player1231231231: { name: Player1231231231, match: 'match1' }
    // Player123121: { name: Player1231121231, match: 'match1' }
}

let games = {
    totalMatches: 0
};

let pendingPlayers = []

io.on('connection', socket => {
    let registeredPlayer = null;
    console.log('new User');
    socket.on('register-player', playerName => {
        registeredPlayer = playerName;

        if(!onlinePlayers[registeredPlayer]) {
            console.log('player name registered: ' + playerName);
            pendingPlayers.push(registeredPlayer);

            console.log('myPlayerObject: ', onlinePlayers[registeredPlayer]);
            
            if(!onlinePlayers[registeredPlayer]) {
                onlinePlayers[registeredPlayer] = { name: registeredPlayer, match: null }
            }

            if(pendingPlayers.length >= 2) {
                let xPlayer = pendingPlayers.shift()
                let oPlayer = pendingPlayers.shift()
                games.totalMatches++;
                const matchName = 'match' + games.totalMatches

                games[matchName] = {
                    xPlayer,
                    oPlayer,
                    status: GAME_STATES.ACTIVE
                }
                
                onlinePlayers[xPlayer] = { name: xPlayer, match: matchName }
                onlinePlayers[oPlayer] = { name: oPlayer, match: matchName }
                console.log(games);
            }
        } else {
            const currentTimestamp = Date.now()
            if(currentTimestamp - PLAYER_SESSION_TIMEOUT < onlinePlayers[registeredPlayer].disconnectedAt) {
                delete onlinePlayers[registeredPlayer].disconnectedAt
            }
        }
    })
    socket.on('disconnect', function () {
        if(!onlinePlayers[registeredPlayer]) {
            return null
        }
        console.log('disconnected event');
        onlinePlayers[registeredPlayer].disconnectedAt = Date.now()

        setTimeout(() => {
            if (onlinePlayers[registeredPlayer] && onlinePlayers[registeredPlayer].disconnectedAt) {
                delete onlinePlayers[registeredPlayer]
                console.log('user will be deleted: ' + registeredPlayer);
                console.log('player after disconnect; ', onlinePlayers);
                registeredPlayer = null;
            }
        }, PLAYER_SESSION_TIMEOUT)
        pendingPlayers = pendingPlayers.filter(player => player !== registeredPlayer)
        console.log(onlinePlayers);
    
    });
    socket.on('set-field', function (move) {
        // one of the players made a move
        console.log(move);
        
    });
})
