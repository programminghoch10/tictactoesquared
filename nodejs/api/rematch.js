const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/rematch', async function (req, res) {
  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let lobbyToken = req.body.lobbyToken

  // check if the lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  // check if the user is inside the lobby
  let correlation = await sql.getCorrelation(user.token, lobbyToken)
  if (!correlation) {
    res.sendStatus(401)
    return
  }

  // get the id of the user
  let userId = lobby.correlations.indexOf(lobby.correlations.find(el => el.usertoken == user.token))

  // if both requested a rematch
  if (lobby.hasFlag("rematch0") && lobby.hasFlag("rematch1")) {
    let game = new Game()
    game.fromString(lobby.game)
    game.init()

    // switch players
    if (lobby.hasFlag("playerinverse")) {
      lobby.removeFlag("playerinverse")
    } else {
      lobby.setFlag("playerinverse")
      game.switchPlayers()
    }

    lobby.game = game.toString()

    lobby.removeFlag("rematch0")
    lobby.removeFlag("rematch1")

    sql.updateLobby(lobby)
    res.sendStatus(200)
    return
  }

  if (lobby.hasFlag("rematch" + userId)) {
    //prevent addition when lobby already has that flag
    res.sendStatus(200)
    return
  }

  lobby.setFlag("rematch" + userId)

  sql.updateLobby(lobby)

  res.sendStatus(200)
})

module.exports = router
