const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/play', async function (req, res) {
  let userToken = req.body.userToken
  let lobbyToken = req.body.lobbyToken
  let a = req.body.a
  let b = req.body.b
  let x = req.body.x
  let y = req.body.y

  try {
    a = parseInt(a)
    b = parseInt(b)
    x = parseInt(x)
    y = parseInt(y)
  } catch {
    res.sendStatus(400)
    return
  }

  // if user exist
  let user = await sql.getUserByToken(userToken)
  if (!user) {
    res.sendStatus(400)
    return
  }

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  // if user is inside lobby
  let correlation = await sql.getCorrelation(userToken, lobbyToken)
  if (!correlation) {
    res.sendStatus(403)
    return
  }

  let gameString = lobby.game
  let size = gameString.substring(0, gameString.indexOf("-"))
  let game = new Game(null, size)
  game.fromString(gameString)

  // get the player
  let player = common.getPlayer(lobby, userToken)

  if (!game._set(a, b, x, y, player)) {
    res.sendStatus(406)
    return
  }

  gameString = game.toString()
  lobby.game = gameString
  sql.updateLobby(lobby)

  res.status(202)
  res.send(gameString)
})

module.exports = router
