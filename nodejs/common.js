let crypto = require("crypto")

const Game = require('../docs/scripts/game.js')

const USER_LIMIT = 50 //limit on how many lobbies a user can be in

function hash(value) {
  let hash = crypto.createHash("sha256")
  hash.update(value)
  return hash.digest('hex')
}

function getTime() {
  return Math.floor(new Date().getTime() / 1000)
}

function isStringEmpty(str) {
  if (str == undefined) return true

  str = str.split(" ").join("")
  return str.length == 0
}

function getPlayer(lobby, user) {
  if (!lobby.correlations) return false
  if (lobby.correlations.length < 1) return false

  if (lobby.correlations[0].usertoken == user.token) return "X"
  if (lobby.correlations.length > 1) if (lobby.correlations[1].usertoken == user.token) return "O"
  return false
}

function extendLobbyInfo(lobby, thisUser, users) {
  //we need to copy the original object to not overwrite the password with a bool while it is used somewhere else asynchronously
  lobby = JSON.parse(JSON.stringify(lobby))
  if (!users) users = []
  lobby.password = !isStringEmpty(lobby.password)
  try {
    lobby.ownername = users.filter(function (user) {
      return (user.token == lobby.correlations[0].usertoken)
    })[0].name
  } catch {
    lobby.ownername = "unknown"
  }
  let game = new Game()
  game.fromString(lobby.game)
  lobby.end = game.end
  lobby.draw = (game.won === "draw")
  if (thisUser) {
    lobby.isyourturn = (getPlayer(lobby, thisUser) === game.currentPlayer)
    lobby.youWon = (getPlayer(lobby, thisUser) === game.won)
    lobby.currentPlayer = game.currentPlayer
    try {
      lobby.opponentname = users.filter(function (user) {
        let isUserCorrelated = false
        lobby.correlations.forEach(correlation => {
          if (user.token == correlation.usertoken) isUserCorrelated = true
        });
        return isUserCorrelated
      }).filter(function (user) {
        return (user.token != thisUser.token)
      })[0].name
    } catch { }
  }
  lobby.playernames = {}
  try {
    lobby.playernames.X = users.find(function (user) { return (user.token == lobby.correlations[0].usertoken) }).name
    lobby.playernames.O = users.find(function (user) { return (user.token == lobby.correlations[1].usertoken) }).name
  } catch {
    if (isStringEmpty(lobby.playernames.X)) lobby.playernames.X = null
    if (isStringEmpty(lobby.playernames.O)) lobby.playernames.O = null
  }
  if (lobby.currentPlayer == "X") {
    lobby.currentPlayerName = lobby.playernames.X
  } else if (lobby.currentPlayer == "O") {
    lobby.currentPlayerName = lobby.playernames.O
  }
  return lobby
}

function parseJSON(json) {
  if (json == "" || json == null || json == "undefined") return []
  return JSON.parse(json)
}

const ESCAPECHARS = [
  { in: "&", out: "&amp;" },
  { in: "<", out: "&lt;" },
  { in: ">", out: "&gt;" },
  { in: "\"", out: "&quot;" },
  { in: "'", out: "&#39;" },
  { in: "%", out: "&#37;" },
]
function sanitizeString(string) {
  if (string == undefined || string == null || typeof string !== "string") return undefined
  // ESCAPECHARS.forEach(value => string = string.split(value.out).join(value.in)) //desanitze first, to prevent multiple sanitizations
  ESCAPECHARS.forEach(value => string = string.split(value.in).join(value.out))
  return string
}

function sanitizeUser(user) {
  user.secret = null
  user.name = sanitizeString(user.name)

  return user
}

function sanitizeLobby(lobby) {
  lobby.name = sanitizeString(lobby.name)
  lobby.description = sanitizeString(lobby.description)
  lobby.ownername = sanitizeString(lobby.ownername)
  lobby.currentPlayerName = sanitizeString(lobby.currentPlayerName)

  if (lobby.playernames != undefined && lobby.playernames != null) {
    lobby.playernames.X = sanitizeString(lobby.playernames.X)
    lobby.playernames.O = sanitizeString(lobby.playernames.O)
  }

  lobby.opponentname = sanitizeString(lobby.opponentname)

  return lobby
}

module.exports = {
  USER_LIMIT: USER_LIMIT,
  hash: hash,
  getTime: getTime,
  isStringEmpty: isStringEmpty,
  getPlayer: getPlayer,
  extendLobbyInfo: extendLobbyInfo,
  parseJSON: parseJSON,
  sanitizeString: sanitizeString,
  sanitizeUser: sanitizeUser,
  sanitizeLobby: sanitizeLobby,
}
