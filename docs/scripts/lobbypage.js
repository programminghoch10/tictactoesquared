let currentGroup = 0

function changeGroup(i) {
    let oldNavEl = getel("navgroup" + currentGroup)
    let currentNavEl = getel("navgroup" + i)
    let oldEl = getel("group" + currentGroup)
    let el = getel("group" + i)

    oldNavEl.classList.remove("current")
    currentNavEl.classList.add("current")
    
    oldEl.classList.add("hide")
    el.classList.remove("hide")

    currentGroup = i
}

let currentBurger = false

function burger() {
    let body = document.body

    if (currentBurger) {
        body.classList.remove("burger")
    } else {
        body.classList.add("burger")
    }

    currentBurger = !currentBurger
}

if (window.innerWidth > 1200) {
    burger()
}

function newLobby() {
    getel("newlobbyoverlay").classList.add("overlay-active")
    getel("newLobbyButton").style.display = "none"
    getel("newLobbyPanel").classList.add("newLobbyPanel-active")

    getel("lobbyname").focus()

    if (currentBurger == true) burger()
}

function returnNewLobby() {
    getel("newlobbyoverlay").classList.remove("overlay-active")
    getel("newLobbyButton").style.display = "block"
    getel("newLobbyPanel").classList.remove("newLobbyPanel-active")
}

function _createLobby() {
    let name = getel("lobbyname").value
    let description = getel("lobbydescription").value
    let password = getel("lobbypassword").value
    createLobby(name, description, password)
    returnNewLobby()
}

function loadJoinedLobbies() {
    let joinedLobbies = getJoinedLobbies()

    let innerHTML = ""

    for (let i = 0; i < joinedLobbies.length; i++) {
        const lobby = joinedLobbies[i]
        let userName = other(lobby.correlations[0].usertoken).name
        if (userName == self().name) {
            if (lobby.correlations.length == 1) {
                userName = WAITINGFORPLAYERSSTRING
            }
        }

        if (lobby.game == undefined || lobby.game == "") lobby.game = "4-"
        const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

        innerHTML += getGame(lobby.name, lobby.description, lobby.password != null && lobby.password != "", userName, fieldSize)
    }

    getel("group0").innerHTML = innerHTML
}

function loadInvitedLobbies() {

}

function loadAllLobbies() {
    
}

const WAITINGFORPLAYERSSTRING = "waiting for players"

function getGame(title, description, password, by, fieldsize) {
    let html = ""

    if (by != WAITINGFORPLAYERSSTRING) {
        by = "by " + by
    }

    if (fieldsize != "3") {
        fieldsize = "fieldsize " + fieldsize
    }

    let lock = ""
    if (password) {
        lock = `<i class="fas fa-lock"></i>`
    }

    let leave = `<div class="button">LEAVE</div>`

    html = `
    <div class="game">
        <div class="title">
            <h2>${title}${lock}</h2>
            <p>${by}</p>
            <p>${fieldsize}</p>
        </div>
        <h3>${description}</h3>
        ${leave}
        <div class="button">PLAY</div>
    </div>
    `

    return html
}