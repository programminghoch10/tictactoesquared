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

let name = getCookie("name")
let token = getCookie("token")

function _addInfo(origin, code) {
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
        case 429:
          tooManyLobbies()
          break
        case 400:
          badRequest()
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "getLobbies":
      switch (code) {
        case 204:
          addInfo("No Lobbies", "There are no lobbies matching your query!", 1)
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "joinLobby":
      switch (code) {
        case 400:
          badRequest()
          break
        case 401:
          addInfo("Incorrect password", "", 2)
          break
        case 403:
          forbidden()
          break
        case 426:
          tooManyLobbies()
          break
        case 406:
          addInfo("Lobby full", "This lobby is full and cannot be joined!", 2)
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "play":
      switch (code) {
        case 400:
          badRequest()
          break
        case 403:
          forbidden()
          break
        case 406:
          addInfo("Oh No!", "You cannot make this move right now.", 2)
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "spectate":
      switch (code) {
        case 400:
          badRequest()
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "leaveLobby":
      switch (code) {
        case 400:
          badRequest()
          break
        case 0:
          unavailable()
          break
        default:
          unknownCode(origin, code)
          break
      }
      break
    case "rematch":
      switch (code) {
        case 400:
          badRequest()
          break
        case 401:
          unauthorized()
          break
        case 0:
          unavailable()
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

  // if name is empty enter a name
  if (isEmpty(name)) {
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
}

function loadName() { return getCookie("name") }
function loadToken() { return getCookie("token") }
function saveName(_name) {
  name = _name
  setGlobalCookie("name", name)
}
function saveToken(_token) {
  token = _token
  setGlobalCookie("token", token)
}

function isEmpty(str) {
  return str.split(" ").join("").length == 0
}

function isUserTokenValid() {
  if (token == "" || token == undefined || token == "undefined") {
    return false
  }

  // make a post request that returns 1 if the token is availabe
  let availabe = post("/api/doesUserTokenExist", { token: token }).responseText

  if (availabe != "true") {
    return false
  }

  return true
}

function changeName(newName) {
  let request = post("/api/changeName", { token: token, name: name })

  let status = request.status
  switch (status) {
    case 409:
      document.location.href = "./inputname.html"
      return
    case 400:
      saveToken("")
      document.location.reload()
      return
    case 200:
      break
    default:
      console.log("changeName got unexpected status code " + status)
    case 304:
      return
  }

  name = request.responseText

  setGlobalCookie("name", name)
}

function createLobby(name, description, password, fieldSize, inviteName, privacy) {
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
  })
  if (req.status != 201) _addInfo("createLobby", req.status)
  return (req.status == 201)
}

function self() {
  return JSON.parse(post("/api/getUser", { token: token }).responseText)
}

function other(_token) {
  let req = post("/api/getUser", { token: _token })
  let res = req.responseText
  if (req.status != 200) res = null
  return parseJSON(res)
}

function getLobby(lobbyToken) {
  return parseJSON(post("/api/getLobby", { lobbytoken: lobbyToken, usertoken: token }).responseText)
}

function getJoinedLobbies() {
  return parseJSON(post("/api/getLobbies", { ownToken: token, joinedOnly: true }).responseText)
}

function getInvitedLobbies() {
  return parseJSON(post("/api/getLobbies", { ownToken: token, invitedOnly: true }).responseText)
}

function getLobbies() {
  let req = post("/api/getLobbies", { ownToken: token })
  let res = req.responseText
  if (req.status != 200) {
    res = null
    _addInfo("getLobbies", req.status)
  }
  return parseJSON(res)
}

function searchLobbies(filter) {
  //TODO: add search for lobbies request to server
}

function joinLobby(lobbyToken, password) {
  let req = post("/api/joinLobby", { lobbytoken: lobbyToken, usertoken: token, password: password })
  if (req.status != 202) _addInfo("joinLobby", req.status)
  return (req.status == 202)
}

function requestPlay(lobbyToken, a, b, x, y) {
  let req = post("/api/play", { userToken: token, lobbyToken: lobbyToken, a: a, b: b, x: x, y: y })
  if (req.status != 202) _addInfo("play", req.status)
  return parseJSON(req.responseText)
}

function spectate(lobbyToken) {
  let req = post("/api/spectate", { lobbyToken: lobbyToken, userToken: token })
  if (req.status != 200) _addInfo("spectate", req.status)
  return parseJSON(req.responseText)
}

function leaveLobby(lobbyToken) {
  let req = post("/api/leaveLobby", { lobbytoken: lobbyToken, usertoken: token })
  if (req.status != 200) _addInfo("leaveLobby", req.status)
  return (req.status == 200)
}

function rematch(lobbyToken) {
  let req = post("/api/rematch", { lobbyToken: lobbyToken, userToken: token })
  if (req.status != 200) _addInfo("rematch", req.status)
  return (req.status == 200)
}
