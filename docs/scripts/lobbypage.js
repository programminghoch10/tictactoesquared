let urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("invites")) {
  setLocalCookie("currentGroup", "1")
  window.location.search = ""
}

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
let spectatable = false
let mayopponentstart
let currentLobbyToken
let currentLobbyName

let filterbylobbyname = ""
let filterbyusername = ""
let filterfieldsize = 3
// it's inverted so the function call will invert it again
if (getCookie("filterprivacy") == "") setGlobalCookie("filterprivacy", 1)
let withoutapassword = getCookie("filterpassword") == 1 ? false : true
let emptylobbies = getCookie("filterprivacy") == 1 ? false : true

let invitedGamesCount = 0
let yourTurnGamesCount = 0

let page = 0
let maxPages = 0

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

  if (currentGroup != i) page = 0

  currentGroup = i
  setLocalCookie("currentGroup", currentGroup)

  getel("grouptitle").innerHTML = ["CURRENT GAMES", "INVITES", "ALL GAMES"][currentGroup]

  let burgerNotification = 0
  if (currentGroup == 0) {
    getel("filtericon").style.display = "none"
    getel("group0inner").innerHTML = ""
    getel("loader").style.display = "block"
    setTimeout(function () {
      loadJoinedLobbies()
      getel("loader").style.display = "none"
    }, 200)
    if (invitedGamesCount > 0) {
      burgerNotification = invitedGamesCount
    }
  } else if (currentGroup == 1) {
    getel("filtericon").style.display = "none"
    getel("group1inner").innerHTML = ""
    getel("loader").style.display = "block"
    setTimeout(function () {
      loadInvitedLobbies()
      getel("loader").style.display = "none"
    }, 200)
    if (yourTurnGamesCount > 0) {
      burgerNotification = yourTurnGamesCount
    }
  } else if (currentGroup == 2) {
    getel("filtericon").style.display = "block"
    getel("group2inner").innerHTML = ""
    getel("loader").style.display = "block"
    setTimeout(function () {
      loadAllLobbies()
      getel("loader").style.display = "none"
    }, 200)
    if (invitedGamesCount > 0) {
      burgerNotification = invitedGamesCount
    }
    if (yourTurnGamesCount > 0) {
      burgerNotification += yourTurnGamesCount
    }
  }

  if (burgerNotification > 0) {
    getel("burgernotification").classList.add("notificationdot-active")
    getel("burgernotification").innerHTML = burgerNotification > 9 ? "9+" : burgerNotification
  } else {
    getel("burgernotification").classList.remove("notificationdot-active")
  }

  setIntervals(currentGroup)
  if (currentBurger) burger()
}

function refresh() {
  getel("group" + currentGroup + "inner").innerHTML = ""
  getel("loader").style.display = "block"
  setTimeout(function () {
    if (currentGroup == 0) {
      loadJoinedLobbies()
    } else if (currentGroup == 1) {
      loadInvitedLobbies()
    } else if (currentGroup == 2) {
      loadAllLobbies()
    }

    getel("loader").style.display = "none"
  }, 10)
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

function quickgamebutton() {
  let lobby = quickgame()
  setGlobalCookie("currentLobbyToken", lobby.token)
  document.location.href = "./multiplayergame.html"
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
  getel('showmoreentry').style.display = 'flex'
  getel('hidden').classList.add('hide')
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

function spectatablePressed() {
  getel("spectatablebutton").classList.add("active-button")
  getel("invisiblebutton").classList.remove("active-button")

  spectatable = true
}

function invisiblePressed() {
  getel("spectatablebutton").classList.remove("active-button")
  getel("invisiblebutton").classList.add("active-button")

  spectatable = false
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
  if (leaveLobby(currentLobbyToken)) {
    addInfo("Lobby left.", "You've left the lobby '" + currentLobbyName + "'", 1)
    changeGroup(currentGroup)
  }

  closeVerificationView()
}

function _createLobby() {
  let lobbyName = getel("lobbyname").value
  let description = getel("lobbydescription").value
  let password = getel("lobbypassword").value
  let fieldSize = getel("lobbyfieldsize").value
  let privacy = newLobbyPrivacy
  let invitePlayer = getel("lobbyinviteplayer").value

  if (invitePlayer == name) {
    addInfo("Nice try :)", "You cannot invite yourself.", 2)
    return
  }

  if (privacy == "closed") {
    if (isStringEmpty(invitePlayer)) {
      addInfo("Invitation failed", "You need to invite someone.", 2)
      return
    }
    if (!doesUserExist(invitePlayer)) {
      addInfo("Invitation failed", "The user with the name '" + invitePlayer + "' does not exist.", 2)
      return
    }
  }

  if (createLobby(lobbyName, description, password, fieldSize, invitePlayer, privacy, mayopponentstart, spectatable)) {
    addInfo("Lobby created.", "The lobby '" + lobbyName + "' got created", 1)
    changeGroup(0)
  }
  closeNewLobbyView()
}

function _joinLobby(lobby, hasPassword, name) {
  if (hasPassword) {
    openPasswordView()
    currentLobbyToken = lobby
    currentLobbyName = name
    return
  }

  if (joinLobby(lobby)) {
    addInfo("Lobby joined.", "You joined the lobby '" + name + "'", 1)
    changeGroup(0)
  }
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

function setPage(i) {
  if (i < 0) i = 0
  if (i > maxPages) i = maxPages

  page = i

  if (currentGroup == 0) {
    loadJoinedLobbies()
  } else if (currentGroup == 1) {
    loadInvitedLobbies()
  } else if (currentGroup == 2) {
    loadAllLobbies()
  }
}

function prevPage() {
  getel("group2inner").innerHTML = ""
  getel("loader").style.display = "block"
  setTimeout(function () {
    setPage(page - 1)
    getel("loader").style.display = "none"
  }, 10)
}

function nextPage() {
  getel("group2inner").innerHTML = ""
  getel("loader").style.display = "block"
  setTimeout(function () {
    setPage(page + 1)
    getel("loader").style.display = "none"
  }, 10)
}

function getLobbyPage(lobbies, page, group) {
  if (group + "" == currentGroup) {
    maxPages = Math.floor(lobbies.length / 10)

    if (page < 0) page = 0
    if (page > maxPages) page = maxPages

    getel("pages").innerHTML = (page + 1) + " / " + (maxPages + 1)

    if (maxPages <= 0 || isNaN(maxPages)) {
      getel("prevpage").style.opacity = 0
      getel("pages").style.opacity = 0
      getel("nextpage").style.opacity = 0
    } else {
      getel("prevpage").style.opacity = 1
      getel("pages").style.opacity = 1
      getel("nextpage").style.opacity = 1
    }
  }

  let newLobbies = []
  for (let index = page * 10; index < (page + 1) * 10; index++) {
    if (index < 0 || index >= lobbies.length) break

    newLobbies.push(lobbies[index])
  }

  return newLobbies
}

async function loadJoinedLobbies() {
  let joinedLobbies = getJoinedLobbies()
  joinedLobbies = getLobbyPage(joinedLobbies, page, 0)

  yourTurnGamesCount = 0

  let innerHTML = ""

  for (let i = 0; i < joinedLobbies.length; i++) {
    try {
      const lobby = joinedLobbies[i]

      if (lobby.isyourturn) {
        yourTurnGamesCount++
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"

      let ruleText = ""
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))
      if (fieldSize != 3) ruleText += "Fieldsize: " + fieldSize + "   "

      let username = ""
      if (lobby.ownername == name) username = "waiting for players"
      if (lobby.opponentname != undefined) username = "against " + lobby.opponentname
      if (lobby.ownername == undefined || lobby.ownername == "undefined") username = ""
      if (lobby.correlations.length == 1 && lobby.correlations.privacy == "open" && lobby.ownername == name) username = WAITINGFORPLAYERSSTRING
      else if (lobby.flags.includes("left")) username = "Your opponent left"

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", username, ruleText, { leave: true, play: true })
    } catch (err) {
      console.log(err)
    }
  }

  if (innerHTML == "") {
    innerHTML = `<div class="nogames">You're currently not playing any games. Let's change that by joining some.</div>`
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
  invitedGamesCount = getLobbyPage(invitedGamesCount, page, 1)

  let innerHTML = ""

  for (let i = 0; i < invitedLobbies.length; i++) {
    const lobby = invitedLobbies[i]
    try {
      let userName = ""
      username = "by " + lobby.ownername
      if (lobby.ownername == name) username = "by yourself"
      if (lobby.ownername == undefined || lobby.ownername == "undefined") username = ""

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"

      let ruleText = ""
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))
      if (fieldSize != 3) ruleText += "Fieldsize: " + fieldSize + "   "

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", username, ruleText, { reject: true, join: true })
    } catch (err) {
      console.log(err)
      console.log(lobby)
    }
  }

  if (innerHTML == "") {
    innerHTML += `<div class="nogames">You have no pending invites.</div>`
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
  let lobbies = getLobbies(filterbylobbyname, filterbyusername, filterfieldsize, withoutapassword ? false : null, !emptylobbies ? null : "open", userCount)
  lobbies = getLobbyPage(lobbies, page, 2)

  let innerHTML = ""

  for (let i = 0; i < lobbies.length; i++) {
    const lobby = lobbies[i]
    let fulllobby = false
    try {
      let username = ""
      username = "by " + lobby.ownername
      if (lobby.ownername == name) username = "by yourself"
      if (lobby.ownername == undefined || lobby.ownername == "undefined") username = ""
      if (lobby.correlations.length == 2) {
        fulllobby = true
        userName = "This lobby is full"
      }

      if (lobby.game == undefined || lobby.game == "") lobby.game = "3-"

      let ruleText = ""
      const fieldSize = lobby.game.substring(0, lobby.game.indexOf("-"))
      if (fieldSize != 3) ruleText += "Fieldsize: " + fieldSize + "   "

      innerHTML += getGame(lobby, lobby.password != null && lobby.password != "", username, ruleText, fulllobby ? { spectate: true } : { join: true })
    } catch (err) {
      console.log(err)
      console.log(lobby)
    }
  }

  if (innerHTML == "") {
    innerHTML = `<div class="nogames">There are no lobbies yet. It's time to create the first one.</div>`
  }

  getel("group2inner").innerHTML = innerHTML
}

function getGame(lobby, password, by, args, flags) {
  let html = ""

  let title = lobby.name
  let description = lobby.description
  let isyourturn = ""

  if (lobby.isyourturn || lobby.flags.includes("left")) {
    isyourturn = `
      <div class="notificationdot notificationdot-active"></div>
    `
  }

  if (by != "" && args != "") {
    args = " - " + args
  }

  let playercolor = 1
  if (lobby.currentPlayer == "O") {
    playercolor = 2
  }

  let lock = ""
  if (password) {
    lock = `<i class="fas fa-lock fa-xs"></i>`
  }

  let buttons = ""
  if (flags.leave) {
    buttons += `<div class="button" onclick="_leaveLobby('${lobby.token}', '${lobby.name}')">LEAVE</div>`
  }
  if (flags.reject) {
    buttons += `<div class="button" onclick="_leaveLobby('${lobby.token}', '${lobby.name}')">REJECT</div>`
  }
  if (flags.join) {
    buttons += `<div class="button" style="color: var(--player${playercolor})" onclick="_joinLobby('${lobby.token}', ${lobby.password}, '${lobby.name}')">JOIN</div>`
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
spectatablePressed()
changeGroup(currentGroup)
withoutPasswordButtonPressed()
emptyLobbiesButtonPressed()
