
const sql = require('./sql.js')
const common = require('./common.js')

const GAME_FINISHED_TIMEOUT = 60 * 15 //in seconds, how long a lobby containing a finished game exists before getting deleted

async function cleanup() {
  console.log("Performing cleanup")
  let now = common.getTime();

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
