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

let name = getCookie("name")
let token = getCookie("token")

function connect() {
  // TODO: check if the cookies are accepted
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
try {
  connect()
} catch { }

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

function createLobby(name, description, password, fieldSize) {
  // TODO: hash password
  let lobbyToken = post("/api/createLobby", {
    name: name,
    description: description,
    password: password,
    ownToken: token,
    fieldSize: fieldSize,
    inviteToken: null,
  })

  console.log(JSON.parse(lobbyToken.responseText))
}

function self() {
  return JSON.parse(post("/api/getUser", { token: token }).responseText)
}

function other(_token) {
  return JSON.parse(post("/api/getUser", { token: _token }).responseText)
}

function getLobby(lobbyToken) {
  return JSON.parse(post("/api/getLobby", { lobbytoken: lobbyToken, usertoken: token }).responseText)
}

function getJoinedLobbies() {
  return JSON.parse(post("/api/getLobbies", { ownToken: token, joinedOnly: true }).responseText)
}

function getInvitedLobbies() {
  return JSON.parse(post("/api/getLobbies", { ownToken: token, invitedOnly: true }).responseText)
}

function getLobbies() {
  let req = post("/api/getLobbies", { ownToken: token })
  if (req.status != 200) return []
  let res = req.responseText
  if (res == null || res == "") return []
  console.log(res)
  return JSON.parse(res)
}

function searchLobbies(filter) {
  //TODO: add search for lobbies request to server
}

function joinLobby(lobbyToken) { return joinLobby(lobbyToken) }
function joinLobby(lobbyToken, password) {
  return (post("/api/joinLobby", { lobbytoken: lobbyToken, usertoken: token, password: password }).status == 202)
}

function requestPlay(lobbyToken, a, b, x, y) {
  let req = post("/api/play", { userToken: token, lobbyToken: lobbyToken, a: a, b: b, x: x, y: y })

  let status = req.status

  switch (status) {
    case 400:
    case 403:
    case 406:
      return
    default:
      console.log("play got unexpected status code " + status)
    case 202:
      break
  }

  let res = req.responseText

  return res
}

function spectate(lobbyToken) {
  let req = post("/api/spectate", { lobbyToken: lobbyToken, userToken: token })

  let status = req.status

  switch (status) {
    case 400:
      return
    default:
      console.log("spectate got unexpected status code " + status)
    case 200:
      break
  }

  return JSON.parse(req.responseText)
}

function leaveLobby(lobbyToken) {
  return (post("/api/leaveLobby", { lobbytoken: lobbyToken, usertoken: token }).status == 200)
}
