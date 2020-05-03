
const sql = require('./sql.js')
const common = require('./common.js')

const GAME_FINISHED_TIMEOUT = 60 * 15 //in seconds, how long a lobby containing a finished game exists before getting deleted
const LOBBY_LEFT_TIMEOUT = 60 * 60 * 24 //in seconds, how long until a lobby, where the opponent left, gets deleted
const LOBBY_QUICKGAME_TIMEOUT = 60 * 60 * 24 * 7 //in seconds, how long until a quick game lobby gets deleted due to inactivity

async function cleanup() {
  console.log("Performing cleanup")
  let now = common.getTime()

  //delete lobbies with no correlations
  let lobbies = await sql.getLobbies()
  if (lobbies) {
    lobbies = lobbies.filter(function (lobby) {
      let deleteThisLobby = false
      try {
        deleteThisLobby += (lobby.correlations.length == 0)
      } catch {
        deleteThisLobby += true
      }
      deleteThisLobby += ((lobby.game.indexOf("!") > -1) && (lobby.lastacttime + GAME_FINISHED_TIMEOUT <= now))
      deleteThisLobby += (lobby.hasFlag("left") && (lobby.lastacttime + LOBBY_LEFT_TIMEOUT <= now))
      deleteThisLobby += (lobby.hasFlag("quickgame") && (lobby.lastacttime + LOBBY_QUICKGAME_TIMEOUT <= now))
      return (deleteThisLobby > 0)
    })
    lobbies.forEach(lobby => {
      sql.deleteLobby(lobby)
    })
  }

  //use SQL cleanup to clean lobbies which are overdue (timeout)
  sql.cleanUp()
}

module.exports = cleanup
