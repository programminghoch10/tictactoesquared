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
  if (!users) users = []
  lobby.password = !isStringEmpty(lobby.password)
  try {
    lobby.ownername = users.filter(function (user) {
      return (user.token == lobby.correlations[0].usertoken)
    })[0].name
  } catch {
    lobby.ownername = "unknown"
  }
  if (thisUser) {
    let game = new Game()
    game.fromString(lobby.game)
    lobby.isyourturn = (getPlayer(lobby, thisUser) == game.currentPlayer)
    lobby.currentPlayer = game.currentPlayer
    try {
      lobby.opponentname = users.filter(function (user) {
        let isUserCorrelated = false
        for (let j = 0; j < lobby.correlations.length; j++) {
          if (user.token == lobby.correlations[j].usertoken) isUserCorrelated = true
        }
        return isUserCorrelated
      }).filter(function (user) {
        return (user.token != thisUser.token)
      })[0].name
    } catch { }
  }
  return lobby
}

function parseJSON(json) {
  if (json == "" || json == null || json == "undefined") return []
  return JSON.parse(json)
}

function sanitizeUser(user) {
  user.secret = null
  return user
}

module.exports = {
  USER_LIMIT: USER_LIMIT,
  hash: hash,
  getTime: getTime,
  isStringEmpty: isStringEmpty,
  getPlayer: getPlayer,
  extendLobbyInfo: extendLobbyInfo,
  parseJSON: parseJSON,
  sanitizeUser: sanitizeUser,
}
