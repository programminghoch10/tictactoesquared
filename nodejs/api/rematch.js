const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/rematch', async function (req, res) {
  let lobbyToken = req.body.lobbyToken
  let userToken = req.body.userToken

  // check if the user exist
  let user = await sql.getUserByToken(userToken)
  if (!user) {
    res.sendStatus(400)
    return
  }

  // check if the lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  // check if the user is inside the lobby
  let correlation = await sql.getCorrelation(userToken, lobbyToken)
  if (!correlation) {
    res.sendStatus(401)
    return
  }

  // get the id of the user
  let userId = lobby.correlations.indexOf(lobby.correlations.find(el => el.usertoken == userToken))

  lobby.setFlag("rematch" + userId)

  // if both requested a rematch
  if (lobby.hasFlag("rematch0") && lobby.hasFlag("rematch1")) {
    let game = new Game()
    game.fromString(lobby.game)
    game.init()
    lobby.game = game.toString()

    lobby.removeFlag("rematch0")
    lobby.removeFlag("rematch1")
  }

  sql.updateLobby(lobby)

  res.sendStatus(200)
})

module.exports = router
