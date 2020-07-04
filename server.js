const socketio = require('socket.io')
const express = require('express')
const { GAME_STATES } = require('./serverConstants')
// const io = require('socket.io')(3000)


const app = express()
app.use(express.static(__dirname + '/client'))

const port = process.env.PORT
const expressServer = app.listen(port)
console.log(`Server listening on port ${port}`)

const io = socketio(expressServer)


const PLAYER_SESSION_TIMEOUT = 10000
let oRequest = false;
let onlinePlayers = {
    // Player5649893: { name: Player5649893, socket, match: 'match1' }
    // Player5673940: { name: Player5673940, socket, match: 'match1' }
}
let pendingPlayers = []
let games = {
    totalMatches: 0
    // matchName: {
    //     xPlayer,
    //     oPlayer,
    //     status: GAME_STATES.ACTIVE,
    // }
};

io.on('connection', socket => {
    let matchName = null;
    let registeredPlayer = null;
    console.log('new connection');

    socket.on('registered', playerName => {
        registeredPlayer = playerName;

        if(!onlinePlayers[registeredPlayer]) {
            onlinePlayers[registeredPlayer] = { name: registeredPlayer, socket: socket, match: null}
            pendingPlayers.push(registeredPlayer);

            console.log('player id registered: ' + socket.id);
            console.log('with playerName: ' + onlinePlayers[registeredPlayer].name);

            if (pendingPlayers.length == 1) {
                socket.on('request-o-sign', () => {
                    oRequest = true;
                })
            } else if(pendingPlayers.length >= 2) {
                createMatch();
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
        console.log(`${registeredPlayer} disconnected`);
        onlinePlayers[registeredPlayer].disconnectedAt = Date.now()

        setTimeout(() => {
            if (onlinePlayers[registeredPlayer] && onlinePlayers[registeredPlayer].disconnectedAt) {
                // deleteMatch(onlinePlayers[registeredPlayer].match);
                delete onlinePlayers[registeredPlayer]
                console.log('user will be deleted: ' + registeredPlayer);
                console.log('player after disconnect: ', onlinePlayers);
                registeredPlayer = null;
            }
        }, PLAYER_SESSION_TIMEOUT)
        pendingPlayers = pendingPlayers.filter(player => player !== registeredPlayer)

    });

})

// function deleteMatch(matchName) {
//     if (games[matchName].xPlayer) {
//         let xPlayer = games[matchName].xPlayer;
//     }
//     if (games[matchName].oPlayer) {
//         let oPlayer = games[matchName].oPlayer;
//     }
//     if ((onlinePlayers[xPlayer])) {
//         onlinePlayers[xPlayer].match = null;
//         pendingPlayers.push(xPlayer)
//     }
//     if ((onlinePlayers[oPlayer])) {
//         onlinePlayers[oPlayer].match = null;
//         pendingPlayers.push(oPlayer)
//     }
//     delete games[matchName];
//     games.totalMatches--;
// }

function createMatch() {
    games.totalMatches++;
    let matchName = `match-${games.totalMatches}`

    let xPlayerName = oRequest ? pendingPlayers.pop() : pendingPlayers.shift()
    let oPlayerName = pendingPlayers.shift()

    let xPlayerID = onlinePlayers[xPlayerName].socket.id;
    let oPlayerID = onlinePlayers[oPlayerName].socket.id;
    games[matchName] = {
        xPlayerID,
        oPlayerID,
        status: GAME_STATES.ACTIVE
    }
    console.log(games);

    onlinePlayers[xPlayerName].socket.emit('match-created', 'x')
    onlinePlayers[oPlayerName].socket.emit('match-created', 'o')
    onlinePlayers[xPlayerName].socket.on('set-field', move => {
        // one of the players made a move
        console.log(`x in ${matchName}: ${move}`);
        onlinePlayers[oPlayerName].socket.emit('field', move);
    });
    onlinePlayers[oPlayerName].socket.on('set-field', move => {
        // one of the players made a move
        console.log(`o in ${matchName}: ${move}`);
        onlinePlayers[xPlayerName].socket.emit('field', move);
    });
}