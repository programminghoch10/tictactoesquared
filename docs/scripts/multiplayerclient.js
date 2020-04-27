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

function connect(_name) {
  // TODO: check if the cookies are accepted
  name = loadName()
  token = loadToken()

  // if name is empty enter a name
  if (isEmpty(name)) {
    saveName(_name)
    createNewUser()
    return
  }

  // if token is invalid create a new user
  if (!isUserTokenValid(token)) {
    createNewUser()
    return
  }
  
}

function createNewUser() {
    let request = post("/createUser", { name: name })

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
  let availabe = post("/doesUserTokenExist", { token: token }).responseText

  if (availabe != "true") {
    return false
  }

  return true
}

function changeName(newName) {
    let request = post("/changeName", { token: token })
    
    let status = request.statusText

    name = request.responseText

    setGlobalCookie("name", name)
}

function createLobby(name, description, password) {
    let lobbyToken = post("/createLobby", {
        name: name,
        description: description,
        password: password,
        ownToken: token,
        inviteToken: null,
    })
}

function self() {
  return JSON.parse(post("/getUser", { token: token }).responseText)
}

function other(_token) {
  return JSON.parse(post("/getUser", { token: _token }).responseText)
}

function getLobby(lobbyToken) {
  return JSON.parse(post("/getLobby", { token: lobbyToken }).responseText)
}

function getJoinedLobbies() {
    return self().lobbytokens
}

function getInvitedLobbies() {
    return self().lobbyinvitetokens
}

function searchLobbies(filter) {

}

function joinLobby() {

}

function requestPlay() {
  
}