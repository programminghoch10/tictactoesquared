const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

const QUICKGAME_FIELDSIZE = 3

router.post('/api/quickgame', async function (req, res) {
  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let lobbies = await sql.getLobbies()
  if (!lobbies) lobbies = []

  lobbies = lobbies.filter(function (lobby) {
    let correlationscount
    try {
      correlationscount = lobby.correlations.length
    } catch {
      correlationscount = 0
    }
    return lobby.hasFlag("quickgame") && correlationscount < 2
  })

  //if user already has a quickgame lobby pending, send it
  let existingquickgamelobby = lobbies.find(lobby => lobby.correlations.find(correlation => correlation.usertoken == user.token))
  if (existingquickgamelobby) {
    res.status(429)
    res.send(JSON.stringify(existingquickgamelobby))
    return
  }

  let lobby = lobbies[0]
  if (lobby) {
    let correlation = new classes.Correlation()
    correlation.lobbytoken = lobby.token
    correlation.usertoken = user.token
    await sql.createCorrelation(correlation)
    res.status(202)
  } else {
    lobby = new classes.Lobby()
    lobby.name = "Quick Game"
    lobby.privacy = "closed"
    lobby.setFlag("quickgame")
    lobby.game = (new Game(null, QUICKGAME_FIELDSIZE)).toString()
    lobby = await sql.createLobby(lobby)
    lobby.name = lobby.name + " " + lobby.token.substring(0, 3)
    sql.updateLobby(lobby)
    let correlation = new classes.Correlation();
    correlation.lobbytoken = lobby.token
    correlation.usertoken = user.token
    await sql.createCorrelation(correlation)
    res.status(201)
  }

  lobby = await sql.getLobbyByToken(lobby.token)

  res.send(JSON.stringify(lobby))

})

module.exports = router
