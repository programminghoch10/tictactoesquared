const WAITINGFORPLAYERSSTRING = "waiting for players"
const LISTUPDATETIME = 60 //in seconds

let currentGroup = getCookie("currentGroup")
let currentBurger = false
let reloadhandler = null

async function changeGroup(i) {
  if (i == undefined || currentGroup == "undefined" || i == "" || i < 0 || i > 2) i = 0
  if (currentGroup == undefined || currentGroup == "undefined" || currentGroup == "" || currentGroup < 0 || currentGroup > 2) currentGroup = 0

  let oldNavEl = getel("navgroup" + currentGroup)
  let currentNavEl = getel("navgroup" + i)
  let oldEl = getel("group" + currentGroup)
  let el = getel("group" + i)

  oldNavEl.classList.remove("current")
  currentNavEl.classList.add("current")

  oldEl.classList.add("hide")
  el.classList.remove("hide")

  currentGroup = i
  setLocalCookie("currentGroup", currentGroup)

  clearInterval(reloadhandler)
  if (currentGroup == 0) {
    setTimeout(loadJoinedLobbies, 200)
    reloadhandler = setInterval(loadJoinedLobbies, LISTUPDATETIME * 1000)
  } else if (currentGroup == 1) {
    setTimeout(loadInvitedLobbies, 200)
    reloadhandler = setInterval(loadInvitedLobbies, LISTUPDATETIME * 1000)
  } else if (currentGroup == 2) {
    setTimeout(loadAllLobbies, 200)
    reloadhandler = setInterval(loadAllLobbies, LISTUPDATETIME * 1000)
  }
  if (currentBurger) burger()
}

function burger() {
  let body = document.body

  if (currentBurger) {
    body.classList.remove("burger")
  } else {
    body.classList.add("burger")
  }

  currentBurger = !currentBurger
}

function newLobby() {
  getel("newlobbyoverlay").classList.add("overlay-active")
  let els = document.getElementsByClassName("add")
  for (let i = 0; i < els.length; i++) {
    const el = els[i];

    el.style.display = "none"
  }
  getel("newLobbyPanel").classList.add("newLobbyPanel-active")

  getel("lobbyname").focus()

  if (currentBurger == true) burger()

  publicLobbyButtonPressed()
}

function returnNewLobby() {
  getel("newlobbyoverlay").classList.remove("overlay-active")
  let els = document.getElementsByClassName("add")
  for (let i = 0; i < els.length; i++) {
    const el = els[i];

    el.style.display = "block"
  }
  getel("newLobbyPanel").classList.remove("newLobbyPanel-active")
}

var newLobbyPrivacy = ""

function inviteOnlyButtonPressed() {
  getel("inviteonlybutton").classList.add("active-button")
  getel("publiclobbybutton").classList.remove("active-button")
  getel("lobbyinviteplayerentry").classList.remove("entry-hide")
  getel("lobbyinviteplayer").setAttribute("required", "")
  getel("lobbypasswordentry").classList.add("entry-hide")
  newLobbyPrivacy = "closed"
}

function publicLobbyButtonPressed() {
  getel("inviteonlybutton").classList.remove("active-button")
  getel("publiclobbybutton").classList.add("active-button")
  getel("lobbyinviteplayerentry").classList.add("entry-hide")
  getel("lobbyinviteplayer").removeAttribute("required")
  getel("lobbypasswordentry").classList.remove("entry-hide")
  newLobbyPrivacy = "open"
}

function _createLobby() {
  let name = getel("lobbyname").value
  let description = getel("lobbydescription").value
  let password = getel("lobbypassword").value
  let fieldSize = getel("lobbyfieldsize").value
  let privacy = newLobbyPrivacy
  let invitePlayer = getel("lobbyinviteplayer").value
  createLobby(name, description, password, fieldSize, invitePlayer, privacy)
  returnNewLobby()
  changeGroup(0)
}

function _joinLobby(lobby) {
  joinLobby(lobby)
  changeGroup(0)
}

function _leaveLobby(lobby) {
  leaveLobby(lobby)
  changeGroup(currentGroup)
}

function play(lobby) {
  setGlobalCookie("currentLobbyToken", lobby)
  document.location.href = "./multiplayergame.html"
}

async function loadJoinedLobbies() {
  let joinedLobbies = getJoinedLobbies()

  let innerHTML = ""

  for (let i = 0; i < joinedLobbies.length; i++) {
    try {
      const lobby = joinedLobbies[i]

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

      let username = ""
      if (lobby.correlations.length == 1) username = WAITINGFORPLAYERSSTRING

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", username, fieldSize, { cog: true, leave: true, play: true })
    } catch (err) {
      console.log(err)
    }
  }

  getel("group0inner").innerHTML = innerHTML
}

async function loadInvitedLobbies() {
  let invitedLobbies = getInvitedLobbies()

  let innerHTML = ""

  for (let i = 0; i < invitedLobbies.length; i++) {
    const lobby = invitedLobbies[i]
    try {
      let userName = ""
      if (lobby.correlations[0].usertoken == token) {
        if (lobby.correlations.length == 1) {
          userName = "yourself"
        }
      } else {
        userName = other(lobby.correlations[0].usertoken).name
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", userName, fieldSize, { join: true })
    } catch (err) {
      console.log(err)
      console.log(lobby)
    }
  }

  getel("group1inner").innerHTML = innerHTML
}

async function loadAllLobbies() {
  let lobbies = getLobbies()

  let innerHTML = ""

  for (let i = 0; i < lobbies.length; i++) {
    const lobby = lobbies[i]
    try {
      let userName = ""
      if (lobby.correlations[0].usertoken == token) {
        if (lobby.correlations.length == 1) {
          userName = "yourself"
        }
      } else {
        //userName = other(lobby.correlations[0].usertoken).name
        userName = lobby.ownername
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", userName, fieldSize, { join: true })
    } catch (err) {
      console.log(err)
      console.log(lobby)
    }
  }

  getel("group2inner").innerHTML = innerHTML
}

function getGame(lobby, password, by, args, flags) {
  let html = ""

  let title = lobby.name
  let description = lobby.description

  if (by != WAITINGFORPLAYERSSTRING && by != "") {
    by = "by " + by
  }

  if (args != "3") {
    args = "fieldsize " + args
  } else {
    args = ""
  }

  let lock = ""
  if (password) {
    lock = `<i class="fas fa-lock fa-xs"></i>`
  }
  if (flags.cog) {
    flags.cog = `<i class="fas fa-cog fa-xs"></i>`
  } else {
    flags.cog = ""
  }

  let buttons = ""
  if (flags.leave) {
    buttons += `<div class="button" onclick="_leaveLobby('${lobby.token}')">LEAVE</div>`
  }
  if (flags.join) {
    buttons += `<div class="button" onclick="_joinLobby('${lobby.token}')">JOIN</div>`
  }
  if (flags.play) {
    buttons += `<div class="button" onclick="play('${lobby.token}')">PLAY</div>`
  }

  html = `
    <div class="game">
        <div class="title">
            <h2>${flags.cog}${lock}<div>${title}</div></h2>
            <p>${by}</p>
            <p>${args}</p>
        </div>
        <h3>${description}</h3>
        <div class="buttons">
            ${buttons}
        </div>
    </div>
    `

  return html
}

window.onresize = resize

function resize() {
  if (window.innerWidth > 1200) {
    getel("burger").classList.add("burger")
    getel("burgerbutton").style.display = "none"
  } else {
    getel("burger").classList.remove("burger")
    getel("burgerbutton").style.display = "block"

  }
}

resize()
publicLobbyButtonPressed()
changeGroup(currentGroup)
