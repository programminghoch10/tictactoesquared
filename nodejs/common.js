let crypto = require("crypto")

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
  }
}
