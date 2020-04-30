let crypto = require("crypto")

const Game = require('../docs/scripts/game.js')

const USER_LIMIT = 50 //limit on how many lobbies a user can be in

module.exports = {
  USER_LIMIT: USER_LIMIT,
  hash: (value) => {
    let hash = crypto.createHash("sha256")
    hash.update(value)
    return hash.digest('hex')
  },
  getTime: () => {
    return Math.floor(new Date().getTime() / 1000)
  },
  isStringEmpty: (str) => {
    if (str == undefined) return true

    str = str.split(" ").join("")
    return str.length == 0
  },
  getPlayer: (lobby, userToken) => {
    if (!lobby.correlations) return false
    if (lobby.correlations.length < 1) return false

    if (lobby.correlations[0].usertoken == userToken) return "X"
    if (lobby.correlations.length > 1) if (lobby.correlations[1].usertoken == userToken) return "O"
    return false
  },
  extendLobbyInfo: async function (lobby, usertoken, users) {
    lobby.password = !this.isStringEmpty(lobby.password)
    try {
      lobbies[i].ownername = users.filter(function (user) {
        return (user.token == lobbies[i].correlations[0].usertoken)
      })[0].name
    } catch {
      lobbies[i].ownername = "unknown"
    }
    if (usertoken) {
      let game = new Game()
      game.fromString(lobby.game)
      lobby.isyourturn = (this.getPlayer(lobby, usertoken) == game.currentPlayer)
      try {
        if (!users) users = await sql.getUsers()
        lobby.opponentname = users.filter(function (user) {
          let isUserCorrelated = false
          for (let j = 0; j < lobby.correlations.length; j++) {
            if (user.token == lobby.correlations[j].usertoken) isUserCorrelated = true
          }
          return isUserCorrelated
        }).filter(function (user) {
          return (user.token != usertoken)
        })[0].name
      } catch { }
    }
    return lobby
  },
}
