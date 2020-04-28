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
}