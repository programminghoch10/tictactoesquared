const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/spectate', async function (req, res) {
  let lobbyToken = req.body.lobbyToken
  let userToken = req.body.userToken

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  if (userToken) {
    let game = new Game();
    game.fromString(lobby.game)
    lobby.isyourturn = (common.getPlayer(lobby, userToken) == game.currentPlayer)
  }

  res.status(200)
  res.send(lobby)
})

module.exports = router
