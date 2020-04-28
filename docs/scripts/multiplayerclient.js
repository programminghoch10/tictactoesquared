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
  if ( self().name != name ) changeName(name)
}
try {
    connect()
} catch {}

function createNewUser() {
    let request = post("/api/createUser", { name: name })

    let status = request.status
    switch(status) {
        case 409:
        case 400:
            saveName("")
            document.location.reload()
            return
        default:
        case 200:
            break;
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
    switch(status) {
        case 409:
            document.location.href =  "./inputname.html"
            return
        case 400:
            saveToken("")
            document.location.reload()
            return
        default:
        case 200:
            break;
    }

    name = request.responseText

    setGlobalCookie("name", name)
}

function createLobby(name, description, password) {
    // TODO: hash password
    let lobbyToken = post("/api/createLobby", {
        name: name,
        description: description,
        password: password,
        ownToken: token,
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
  return JSON.parse(post("/api/getLobby", { token: lobbyToken }).responseText)
}

function getJoinedLobbies() {
    let correlations = self().correlations
    correlations.filter(function(correlation) {return !correlation.invite})
    let lobbies = new Array(correlations.length)
    for (let i = 0; i < correlations.length; i++) {
        lobbies[i] = getLobby(correlations[i].lobbytoken)
    }
    return lobbies
}

function getInvitedLobbies() {
    let correlations = self().correlations
    correlations.filter(function(correlation) {return correlation.invite})
    let lobbies = new Array(correlations.length)
    for (let i = 0; i < correlations.length; i++) {
        lobbies[i] = getLobby(correlations[i].lobbytoken)
    }
    return lobbies
}

function searchLobbies(filter) {
    //TODO: add search for lobbies request to server
}

function joinLobby(lobbyToken) {return joinLobby(lobbyToken, null)}
function joinLobby(lobbyToken, password) {
    return (post("/api/joinLobby", {lobbytoken: lobbyToken, usertoken: token, password: password}).status == 202)
}

function requestPlay() {
  
}

console.log(name)
getel("username").innerHTML = name