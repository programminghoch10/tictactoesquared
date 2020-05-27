const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/play', async function (req, res) {
  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

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

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  // if user is not inside lobby
  let correlation = await sql.getCorrelation(user.token, lobbyToken)
  if (!correlation) {
    res.sendStatus(403)
    return
  }

  let gameString = lobby.game
  let size = gameString.substring(0, gameString.indexOf("-"))
  let game = new Game(null, size)
  game.fromString(gameString)

  // get the player
  let player = common.getPlayer(lobby, user)

  if (!game._set(a, b, x, y, player)) {
    res.sendStatus(406)
    return
  }

  gameString = game.toString()
  // console.log(gameString)
  lobby.game = gameString
  sql.updateLobby(lobby)

  lobby = common.extendLobbyInfo(lobby, user, await sql.getUsers())
  lobby = common.sanitizeLobby(lobby)

  res.status(202)
  res.send(lobby)
})

module.exports = router
