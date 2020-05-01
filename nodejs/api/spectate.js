const express = require('express')
let router = express.Router()

const Game = require("../../docs/scripts/game.js")
const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/spectate', async function (req, res) {

  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let lobbyToken = req.body.lobbyToken

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  // if the lobby is closed and there is only one player
  if (lobby.privacy == "closed" && lobby.correlations.length == 1) {
    let game = new Game()
    game.fromString(lobby.game)
    game.giveUp()
    lobby.game = game.toString()
  }

  lobby = common.extendLobbyInfo(lobby, user, await sql.getUsers())

  res.status(200)
  res.send(lobby)
})

module.exports = router
