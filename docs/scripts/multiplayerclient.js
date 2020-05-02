function getel(name) { return document.getElementById(name) }

function post(url, data) {
  let request = $.ajax({
    type: "POST",
    url: url,
    data: data,
    async: false
  })

  return request
}

function parseJSON(json) {
  if (json == "" || json == null || json == "undefined") return []
  return JSON.parse(json)
}

let name = loadName()
let token = loadToken()
let secret = loadSecret()

function notifyUser(origin, code) {
  //filter out successful requests, still show info, because this only shows when the according function didnt filter their successful request
  switch (code) {
    case 200:
    case 201:
    case 202:
      addInfo("Successful", "Call to " + origin + " returned " + code, 0)
      return
    default:
      break
  }
  function unknownCode(origin, code) {
    addInfo(code, "An unknown error occured in " + origin + "!", 1)
    console.log("Encountered unexpected " + code + " in " + origin)
  }
  function badRequest() {
    addInfo("Bad request", "Something went wrong, please try again later.", 2)
  }
  function unauthorized() {
    addInfo("Unautorized", "It seems like you are not authorized to perform this action.", 3)
  }
  function forbidden() {
    addInfo("Forbidden", "You cannot perform this action.", 3)
  }
  function tooManyRequests() {
    addInfo("Too Many Requests", "Woah! Settle down a bit!", 2)
  }
  function tooManyLobbies() {
    addInfo("Too Many Games", "You reached the maximum number of games. Leave some and try again.", 2)
  }
  function unavailable() {
    addInfo("Server unavailable", "It seems like the server is currently not available. Is your internet connection working properly?", 3)
  }
  switch (origin) {
    default:
      unknownCode(origin, code)
      break
    case "createLobby":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          badRequest()
          break
        case 401:
          unauthorized()
          break
        case 429:
          tooManyLobbies()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "getLobbies":
      switch (code) {
        case 0:
          unavailable()
          break
        case 204:
          // addInfo("No LobbNo Lobbies", "There are no lobbies matching your query!", 1)
          break
        case 401:
          unauthorized()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "joinLobby":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          badRequest()
          break
        case 401:
          //assuming incorrect password, could also be user not existing
          addInfo("Incorrect password", "", 2)
          break
        case 403:
          forbidden()
          break
        case 406:
          addInfo("Lobby full", "This lobby is full and cannot be joined!", 2)
          break
        case 426:
          tooManyLobbies()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "play":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          badRequest()
          break
        case 401:
          unauthorized()
          break
        case 403:
          forbidden()
          break
        case 406:
          addInfo("Oh No!", "You cannot make this move right now.", 2)
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "spectate":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          // the server got closed
          setGlobalCookie("lobbyclosed", 1)
          document.location.href = "multiplayer.html"
          break
        case 401:
          unauthorized()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "leaveLobby":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          badRequest()
          break
        case 401:
          unauthorized()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "rematch":
      switch (code) {
        case 0:
          unavailable()
          break
        case 400:
          badRequest()
          break
        case 401:
          unauthorized()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
  }
}

function connect() {
  if (!cookiesAccepted()) {
    document.location.href = "./cookiesdisabled.html"
    return
  }

  name = loadName()
  token = loadToken()
  secret = loadSecret()

  // if name is empty enter a name
  if (isStringEmpty(name)) {
    document.location.href = "./inputname.html"
    return
  }

  // if token is invalid create a new user
  if (!isUserTokenValid(token)) {
    createNewUser()
    return
  }
  if (self().name != name) changeName(name)
}

function createNewUser() {
  let request = post("/api/createUser", { name: name })

  let status = request.status
  switch (status) {
    case 409:
    case 400:
      saveName("")
      document.location.reload()
      return
    default:
      console.log("createNewUser got unexpected status code " + status)
    case 201:
      break
  }

  // TODO: check if valid

  let user = JSON.parse(request.responseText)

  saveToken(user.token)
  saveSecret(user.secret)
  saveName(user.name)
}

function loadName() { return getCookie("name") }
function loadToken() { return getCookie("token") }
function loadSecret() { return getCookie("secret") }
function saveName(_name) {
  name = _name
  setGlobalCookie("name", name)
}
function saveToken(_token) {
  token = _token
  setGlobalCookie("token", token)
}
function saveSecret(_secret) {
  secret = _secret
  setGlobalCookie("secret", secret)
}

function resetIdentity() {
  saveSecret("")
  saveToken("")
  document.location.reload()
}

function isStringEmpty(str) {
  return str.split(" ").join("").length == 0
}

function isUserTokenValid() {
  if (token == "" || token == undefined || token == "undefined") {
    return false
  }

  // make a post request that returns 1 if the token is availabe
  let req = post("/api/doesUserTokenExist", { token: token, secret: secret })

  if (req.status == 401) return false

  if (req.responseText != "true") {
    return false
  }

  return true
}

function changeName(newName) {
  let request = post("/api/changeName", { token: token, name: name, secret: secret })

  let status = request.status
  switch (status) {
    case 400:
      saveName("")
      document.location.reload()
      return
    case 401:
      resetIdentity()
      return
    case 409:
      document.location.href = "./inputname.html"
      return
    case 200:
      break
    case 304:
      return
    default:
      console.log("changeName got unexpected status code " + status)
  }
}

function createLobby(name, description, password, fieldSize, inviteName, privacy, opponentStart) {
  // TODO: hash password
  switch (privacy) {
    default:
    case "open":
      inviteName = null
      break
    case "closed":
      password = null
      break
  }
  let req = post("/api/createLobby", {
    name: name,
    description: description,
    password: password,
    ownToken: token,
    fieldSize: fieldSize,
    inviteName: inviteName,
    secret: secret,
    opponentStart: opponentStart
  })
  if (req.status != 201) notifyUser("createLobby", req.status)
  return (req.status == 201)
}

function self() {
  return parseJSON(post("/api/getUser", { token: token, secret: secret }).responseText)
}

function other(_token) {
  let req = post("/api/getUser", { token: _token, secret: secret })
  let res = req.responseText
  if (req.status != 200) res = null
  return parseJSON(res)
}

function getLobby(lobbyToken) {
  return parseJSON(post("/api/getLobby", { lobbytoken: lobbyToken, usertoken: token, secret: secret }).responseText)
}

function getJoinedLobbies() {
  return parseJSON(post("/api/getLobbies", { ownToken: token, joinedOnly: true, secret: secret }).responseText)
}

function getInvitedLobbies() {
  return parseJSON(post("/api/getLobbies", { ownToken: token, invitedOnly: true, secret: secret }).responseText)
}

function getLobbies(lobbyName, userName, fieldSize, hasPassword, privacy, userCount) {
  let req = post("/api/getLobbies", {
    usertoken: token,
    secret: secret,
    lobbyName: lobbyName,
    userName: userName,
    fieldSize: fieldSize,
    hasPassword: hasPassword,
    privacy: privacy,
  })
  let res = req.responseText
  if (req.status == 401) resetIdentity()
  if (req.status != 200) {
    res = null
    notifyUser("getLobbies", req.status)
  }
  return parseJSON(res)
}

function joinLobby(lobbyToken, password) {
  let req = post("/api/joinLobby", { lobbytoken: lobbyToken, usertoken: token, password: password, secret: secret })
  //no handling for 401, because it can be either wrong password or invalid user
  if (req.status != 202) notifyUser("joinLobby", req.status)
  return (req.status == 202)
}

function requestPlay(lobbyToken, a, b, x, y) {
  let req = post("/api/play", { userToken: token, lobbyToken: lobbyToken, a: a, b: b, x: x, y: y, secret: secret })
  if (req.status != 202) notifyUser("play", req.status)
  return parseJSON(req.responseText)
}

function spectate(lobbyToken) {
  let req = post("/api/spectate", { lobbyToken: lobbyToken, userToken: token, secret: secret })
  if (req.status != 200) notifyUser("spectate", req.status)
  return parseJSON(req.responseText)
}

function leaveLobby(lobbyToken) {
  let req = post("/api/leaveLobby", { lobbytoken: lobbyToken, usertoken: token, secret: secret })
  if (req.status != 200) notifyUser("leaveLobby", req.status)
  return (req.status == 200)
}

function rematch(lobbyToken) {
  let req = post("/api/rematch", { lobbyToken: lobbyToken, userToken: token, secret: secret })
  if (req.status != 200) notifyUser("rematch", req.status)
  return (req.status == 200)
}
