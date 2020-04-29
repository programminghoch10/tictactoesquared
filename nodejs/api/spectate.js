const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/spectate', async function (req, res) {
  let lobbyToken = req.body.lobbyToken

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  let gameString = lobby.game

  res.status(200)
  res.send(gameString)
})

module.exports = router
