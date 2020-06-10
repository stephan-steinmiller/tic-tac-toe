const socket = io("http://localhost:3000")

socket.on("chat-message", data => {
    console.log(data)
})


const match = JSON.parse(matchString)
        '{matchName:"match1", Player123123213Symbol:"x",Player43243434Symbol:"o"}'
        window.match = match
    })
    window.gameSocket = socket
}