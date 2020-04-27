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
  name = getCookie("name")
  token = getCookie("token")

  // is the token empty ask for a name
  // remove the old token so it gets requested again
  if (!isUserTokenValid(token)) {
    enterName(_name)
  }

  // if the token is invalid
  if (!isUserTokenValid(token)) {
    // request a new token
    token = requestUserToken()

    // if the token is still invalid
    if (!isUserTokenValid(token)) {
      console.log("Something went wrong.")
      return
    }

    setGlobalCookie("token", token)
  }

  setGlobalCookie("name", name)

  console.log("name: " + name)
  console.log("token: " + token)
}

function enterName(_name) {
  name =_name
}

function setName(_name) {
  if (!isNameValid(name)) return

  name = _name

  setGlobalCookie(name)

  token = ""
}

function isNameValid() {
  // TODO: make a client side validation check
  return true
}

function requestUserToken() {
  return post("/requestUserToken", { name: name }).responseText
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