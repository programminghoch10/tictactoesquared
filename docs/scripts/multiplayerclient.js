function post(url, data) {
  let request = $.ajax({
    type: "POST",
    url: url,
    data: data,
    async: false
  })

  return request.responseText
}

let name = getCookie("name")
let token = getCookie("token")

function connect(_name) {
  name = getCookie("name")
  token = getCookie("token")

  // is the token empty ask for a name
  // remove the old token so it gets requested again
  if (!isPlayerTokenValid(token)) {
    enterName(_name)
  }

  // if the token is invalid
  if (!isPlayerTokenValid(token)) {
    // request a new token
    token = requestPlayerToken()

    // if the token is still invalid
    if (!isPlayerTokenValid(token)) {
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

function requestPlayerToken() {
  return post("/requestPlayerToken", { name: name })
}

function isPlayerTokenValid() {
  if (token == "" || token == undefined || token == "undefined") {
    return false
  }

  // make a post request that returns 1 if the token is availabe
  let availabe = post("/doesPlayerTokenExist", { token: token })

  if (availabe != "true") {
    return false
  }

  return true
}

function createLobby() {

}

function getJoinedLobbies() {

}

function getInvitedLobbies() {

}

function searchLobbies(filter) {

}

function joinLobby() {

}

function requestPlay() {
  
}