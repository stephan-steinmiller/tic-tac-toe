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


const PLAYER_SESSION_TIMEOUT = 10000
let onlinePlayers = {
    // Player5649893: { name: 'Player5649893', match: 'match1', sign: 'x' }
    // Player5673940: { name: 'Player5673940', match: 'match1', sign: 'o' }
}

let games = {
    totalMatches: 0
    // matchName: {
    //     xPlayer,
    //     oPlayer,
    //     status: GAME_STATES.ACTIVE,
    // }
};

let pendingPlayers = []

io.on('connection', socket => {
    let matchName;
    let registeredPlayer = null;
    console.log('new connection');
    socket.on('register-player', playerName => {
        registeredPlayer = playerName;

        if(!onlinePlayers[registeredPlayer]) {
            pendingPlayers.push(registeredPlayer);
            console.log('player name registered: ' + playerName);

            console.log('myPlayerObject: ', onlinePlayers[registeredPlayer]);
            
            if(!onlinePlayers[registeredPlayer]) {
                onlinePlayers[registeredPlayer] = { name: registeredPlayer, match: null, sign: null }
            }

            if(pendingPlayers.length >= 2) {
                
                let xPlayer = pendingPlayers.shift()
                let oPlayer = pendingPlayers.shift()
                games.totalMatches++;
                matchName = `match-${games.totalMatches}`

                games[matchName] = {
                    xPlayer,
                    oPlayer,
                    status: GAME_STATES.ACTIVE
                }
                
                onlinePlayers[xPlayer] = { name: xPlayer, match: matchName, sign: 'x' }
                onlinePlayers[oPlayer] = { name: oPlayer, match: matchName, sign: 'o' }
                console.log(games);
                
                socket.emit('match-created', games[matchName])
                socket.broadcast.emit('match-created', games[matchName])
            }
        } else {
            const currentTimestamp = Date.now()
            if(currentTimestamp - PLAYER_SESSION_TIMEOUT < onlinePlayers[registeredPlayer].disconnectedAt) {
                delete onlinePlayers[registeredPlayer]
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
                deleteMatch(onlinePlayers[registeredPlayer].match);
                delete onlinePlayers[registeredPlayer]
                console.log('user will be deleted: ' + registeredPlayer);
                console.log('player after disconnect: ', onlinePlayers);
                registeredPlayer = null;
            }
        }, PLAYER_SESSION_TIMEOUT)
        pendingPlayers = pendingPlayers.filter(player => player !== registeredPlayer)
        console.log(onlinePlayers);
    
    });
    socket.on('set-field', move => {
        // one of the players made a move
        console.log(move);
        socket.broadcast.emit('field', move);
    });
})

function deleteMatch(matchName) {
    if (games[matchName].xPlayer) {
        let xPlayer = games[matchName].xPlayer;
    }
    if (games[matchName].oPlayer) {
        let oPlayer = games[matchName].oPlayer;
    }
    if ((onlinePlayers[xPlayer])) {
        onlinePlayers[xPlayer].match = null;
        pendingPlayers.push(xPlayer)
    }
    if ((onlinePlayers[oPlayer])) {
        onlinePlayers[oPlayer].match = null;
        pendingPlayers.push(oPlayer)
    }
    delete games[matchName];
    games.totalMatches--;
}


