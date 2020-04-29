
const sql = require('./sql.js')

async function cleanup() {
  console.log("Performing cleanup")

  //delete lobbies with no correlations
  let lobbies = await sql.getLobbies()
  if (lobbies) {
    lobbies = lobbies.filter(function (lobby) {
      try {
        return (lobby.correlations.length == 0)
      } catch {
        return true
      }
    })
    lobbies.forEach(lobby => {
      sql.deleteLobby(lobby)
    })
  }

  //use SQL cleanup to clean lobbies which are overdue (timeout)
  sql.cleanUp()
}

module.exports = cleanup
