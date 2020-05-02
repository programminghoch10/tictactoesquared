const WAITINGFORPLAYERSSTRING = "waiting for players"

// in seconds
const JOINLOBBIESREFRESHTIME = 10
const INVITEDLOBBIESREFRESHTIME = 10
const ALLLOBBIESREFRESHTIME = 60

const JOINLOBBIESREFRESHTIME2 = 5
const INVITEDLOBBIESREFRESHTIME2 = 5
const ALLLOBBIESREFRESHTIME2 = 30

let joinlobbyinterval = null
let invitedlobbiesinterval = null
let alllobbiesinterval = null

let currentGroup = getCookie("currentGroup")
let currentBurger = false

let newLobbyPrivacy = ""
let mayopponentstart
let currentLobbyToken
let currentLobbyName

let filterbylobbyname = ""
let filterbyusername = ""
let filterfieldsize = 3
// it's inverted so the function call will invert it again
let withoutapassword = getCookie("filterpassword") == 1 ? true : false
let emptylobbies = getCookie("filterprivacy") == 1 ? false : true

let invitedGamesCount = 0
let yourTurnGamesCount = 0

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

  getel("grouptitle").innerHTML = ["CURRENT GAMES", "INVITED GAMES", "ALL GAMES"][currentGroup]

  let burgerNotification = false
  if (currentGroup == 0) {
    setTimeout(loadJoinedLobbies, 200)
    if (invitedGamesCount > 0) {
      burgerNotification = true
    }
  } else if (currentGroup == 1) {
    setTimeout(loadInvitedLobbies, 200)
    if (yourTurnGamesCount > 0) {
      burgerNotification = true
    }
  } else if (currentGroup == 2) {
    setTimeout(loadAllLobbies, 200)
    if (invitedGamesCount > 0) {
      burgerNotification = true
    }
    if (yourTurnGamesCount > 0) {
      burgerNotification = true
    }
  }

  if (burgerNotification) {
    getel("burgernotification").classList.add("notificationdot-active")
  } else {
    getel("burgernotification").classList.remove("notificationdot-active")
  }

  setIntervals(currentGroup)
  if (currentBurger) burger()
}

function refresh() {
  if (currentGroup == 0) {
    loadJoinedLobbies()
  } else if (currentGroup == 1) {
    loadInvitedLobbies()
  } else if (currentGroup == 2) {
    loadAllLobbies()
  }
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
  getel("lobbyname").value = ""
  getel("lobbydescription").value = ""
  getel("lobbypassword").value = ""
  getel("lobbyinviteplayer").value = ""
  getel("lobbyfieldsize").value = 3
  let els = document.getElementsByClassName("add")
  for (let i = 0; i < els.length; i++) {
    const el = els[i];

    el.style.display = "none"
  }
  getel("newLobbyPanel").classList.add("panel-active")

  getel("lobbyname").focus()

  if (currentBurger == true) burger()

  publicLobbyButtonPressed()
  mayopponentstart = true
  mayopponentstartPressed()
}

function closeNewLobbyView() {
  getel("newlobbyoverlay").classList.remove("overlay-active")
  let els = document.getElementsByClassName("add")
  for (let i = 0; i < els.length; i++) {
    const el = els[i];

    el.style.display = "block"
  }
  getel("newLobbyPanel").classList.remove("panel-active")
}

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

function mayopponentstartPressed() {
  mayopponentstart = !mayopponentstart
  if (mayopponentstart) {
    getel("opponentstarts").classList.add("active-button")
  } else {
    getel("opponentstarts").classList.remove("active-button")
  }
}

function openPasswordView() {
  getel("passwordInputOverlay").classList.add("overlay-active")
  getel("passwordInput").classList.add("panel-active")
  getel("password").value = ""
}

function closePasswordView() {
  getel("passwordInputOverlay").classList.remove("overlay-active")
  getel("passwordInput").classList.remove("panel-active")
}

function openVerificationView() {
  getel("verificationViewOverlay").classList.add("overlay-active")
  getel("verificationView").classList.add("panel-active")
}

function closeVerificationView() {
  getel("verificationViewOverlay").classList.remove("overlay-active")
  getel("verificationView").classList.remove("panel-active")
}

function openFilterView() {
  getel("filterViewOverlay").classList.add("overlay-active")
  getel("filterView").classList.add("panel-active")
}

function closeFilterView() {
  getel("filterViewOverlay").classList.remove("overlay-active")
  getel("filterView").classList.remove("panel-active")
}

function withoutPasswordButtonPressed() {
  withoutapassword = !withoutapassword
  if (withoutapassword) {
    getel("filterViewPasswordButton").classList.add("active-button")
  } else {
    getel("filterViewPasswordButton").classList.remove("active-button")
  }
  setGlobalCookie("filterpassword", withoutapassword ? 1 : 0)
}

function emptyLobbiesButtonPressed() {
  emptylobbies = !emptylobbies
  if (emptylobbies) {
    getel("filterViewEmptyButton").classList.add("active-button")
  } else {
    getel("filterViewEmptyButton").classList.remove("active-button")
  }
  setGlobalCookie("filterprivacy", emptylobbies ? 1 : 0)
}

function useFilters() {
  filterbylobbyname = getel("filterviewlobbyname").value
  filterbyusername = getel("filterviewusername").value
  filterfieldsize = getel("filterfieldsize").value
  closeFilterView()
  changeGroup(2)
}

function leaveLobbyVerificated() {
  leaveLobby(currentLobbyToken)
  closeVerificationView()
  changeGroup(currentGroup)
  addInfo("Lobby left.", "You've left the lobby '" + currentLobbyName + "'", 1)
}

function _createLobby() {
  let name = getel("lobbyname").value
  let description = getel("lobbydescription").value
  let password = getel("lobbypassword").value
  let fieldSize = getel("lobbyfieldsize").value
  let privacy = newLobbyPrivacy
  let invitePlayer = getel("lobbyinviteplayer").value
  createLobby(name, description, password, fieldSize, invitePlayer, privacy)
  addInfo("Lobby created.", "The lobby '" + name + "' got created", 1)
  closeNewLobbyView()
  changeGroup(0)
}

function _joinLobby(lobby, hasPassword, name) {
  if (hasPassword) {
    openPasswordView()
    currentLobbyToken = lobby
    currentLobbyName = name
    return
  }

  addInfo("Lobby joined.", "You joined the lobby '" + name + "'", 1)
  joinLobby(lobby)
  changeGroup(0)
}

function _joinLobbyWithPassword() {
  let req = joinLobby(currentLobbyToken, getel("password").value)

  if (req == true) {
    changeGroup(0)
    addInfo("Lobby joined.", "You've joined the lobby '" + currentLobbyName + "'", 1)
  }

  closePasswordView()
}

function _leaveLobby(lobby, name) {
  currentLobbyToken = lobby
  currentLobbyName = name
  openVerificationView()
}

function play(lobby) {
  setGlobalCookie("currentLobbyToken", lobby)
  document.location.href = "./multiplayergame.html"
}

async function loadJoinedLobbies() {
  let joinedLobbies = getJoinedLobbies()
  yourTurnGamesCount = 0

  let innerHTML = ""

  for (let i = 0; i < joinedLobbies.length; i++) {
    try {
      const lobby = joinedLobbies[i]

      if (lobby.isyourturn || (lobby.correlations.length == 1 && lobby.privacy == "closed")) {
        yourTurnGamesCount++
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

      let username = ""
      if (lobby.correlations.length == 1 && lobby.correlations.privacy == "open" && lobby.correlations[0].usertoken == token) username = WAITINGFORPLAYERSSTRING
      else if (lobby.correlations[0].usertoken == token) username = "by yourself"
      else username = "by " + other(lobby.correlations[0].usertoken).name

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", username, fieldSize, { leave: true, play: true })
    } catch (err) {
      console.log(err)
    }
  }

  getel("group0inner").innerHTML = innerHTML

  setTimeout(function () {
    if (yourTurnGamesCount == 0) {
      getel("isyourturn").classList.remove("notificationdot-active")
    } else {
      getel("isyourturn").classList.add("notificationdot-active")
      getel("isyourturn").innerHTML = yourTurnGamesCount > 9 ? "9+" : yourTurnGamesCount
    }
  }, 10)

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
          userName = "by yourself"
        }
      } else {
        userName = "by " + other(lobby.correlations[0].usertoken).name
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

  invitedGamesCount = invitedLobbies.length
  if (invitedLobbies.length == 0) {
    getel("invitednotice").classList.remove("notificationdot-active")
  } else {
    getel("invitednotice").classList.add("notificationdot-active")
    getel("invitednotice").innerHTML = invitedLobbies.length > 9 ? "9+" : invitedLobbies.length
  }
}

async function loadAllLobbies() {
  let userCount = null
  if (emptylobbies) {
    userCount = 2
  }
  let lobbies = getLobbies(filterbylobbyname, filterbyusername, filterfieldsize, withoutapassword, emptylobbies ? "closed" : "open", userCount)

  let innerHTML = ""

  for (let i = 0; i < lobbies.length; i++) {
    const lobby = lobbies[i]
    let fulllobby = false
    try {
      let userName = ""
      if (lobby.correlations[0].usertoken == token) {
        if (lobby.correlations.length == 1) {
          userName = "by yourself"
        }
      } else if (lobby.correlations.length == 2) {
        fulllobby = true
        userName = "This lobby is full"
      } else {
        //userName = other(lobby.correlations[0].usertoken).name
        userName = "by " + lobby.ownername
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", userName, fieldSize, fulllobby ? { spectate: true } : { join: true })
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
  let isyourturn = ""

  if (lobby.isyourturn || (lobby.correlations.length == 1 && lobby.privacy == "closed")) {
    isyourturn = `
      <div class="notificationdot notificationdot-active"></div>
    `
  }

  let playercolor = 1
  if (lobby.currentPlayer == "O") {
    playercolor = 2
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

  let buttons = ""
  if (flags.leave) {
    buttons += `<div class="button" onclick="_leaveLobby('${lobby.token}', '${lobby.name}')">LEAVE</div>`
  }
  if (flags.join) {
    buttons += `<div class="button" onclick="_joinLobby('${lobby.token}', ${lobby.password}, '${lobby.name}')">JOIN</div>`
  }
  if (flags.play) {
    buttons += `<div class="button" style="color: var(--player${playercolor})" onclick="play('${lobby.token}')">PLAY${isyourturn}</div>`
  }
  if (flags.spectate) {
    buttons += `<div class="button" style="color: var(--player${playercolor})" onclick="play('${lobby.token}')">WATCH</div>`
  }

  html = `
    <div class="game">
        <div class="title">
            <h2>${lock}<div>${title}</div></h2>
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

function lobbyClosed() {
  if (getCookie("lobbyclosed") == 1) {
    setGlobalCookie("lobbyclosed", 0)
    addInfo("The lobby closed", "The lobby closed due to inactivity", 1)
  }
}

function refreshJoinedLobbies() {
  loadJoinedLobbies()
}

function refreshInvitedLobbies() {
  loadInvitedLobbies()
}

function refreshAllLobbies() {
  loadAllLobbies()
}

function setIntervals(i) {
  if (joinlobbyinterval != null) clearInterval(joinlobbyinterval)
  if (invitedlobbiesinterval != null) clearInterval(invitedlobbiesinterval)
  if (alllobbiesinterval != null) clearInterval(alllobbiesinterval)
  if (i != 0) joinlobbyinterval = setInterval(refreshJoinedLobbies, JOINLOBBIESREFRESHTIME * 1000)
  if (i != 1) invitedlobbiesinterval = setInterval(refreshInvitedLobbies, INVITEDLOBBIESREFRESHTIME * 1000)
  if (i != 2) alllobbiesinterval = setInterval(refreshAllLobbies, ALLLOBBIESREFRESHTIME * 1000)
  if (i == 0) joinlobbyinterval = setInterval(refreshJoinedLobbies, JOINLOBBIESREFRESHTIME2 * 1000)
  if (i == 1) invitedlobbiesinterval = setInterval(refreshInvitedLobbies, INVITEDLOBBIESREFRESHTIME2 * 1000)
  if (i == 2) alllobbiesinterval = setInterval(refreshAllLobbies, ALLLOBBIESREFRESHTIME2 * 1000)
}
refreshJoinedLobbies()
refreshInvitedLobbies()
refreshAllLobbies()

setTimeout(lobbyClosed, 10)
resize()
publicLobbyButtonPressed()
changeGroup(currentGroup)
withoutPasswordButtonPressed()
emptyLobbiesButtonPressed()
