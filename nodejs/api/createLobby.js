const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

const USER_LIMIT = common.USER_LIMIT
const MIN_FIELD_SIZE = 3
const MAX_FIELD_SIZE = 5

router.post('/api/createLobby', async function (req, res) {

  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let name = req.body.name
  let description = req.body.description
  let password = req.body.password
  let fieldSize = req.body.fieldSize
  let inviteName = req.body.inviteName
  let opponentStart = req.body.opponentStart

  if (common.isStringEmpty(name)) {
    res.sendStatus(400)
    return
  }

  // if field size is valid
  try {
    let num = parseInt(fieldSize)
    if (num < MIN_FIELD_SIZE || num > MAX_FIELD_SIZE) {
      res.sendStatus(400)
      return
    }
  } catch {
    res.sendStatus(400)
    return
  }

  // limit max lobbies per user
  if (user.correlations) {
    if (user.correlations.length > USER_LIMIT) {
      res.sendStatus(429)
      return
    }
  }

  let invite = false
  // if invite name is not null
  // the lobby's privacy is closed
  //TODO: switch to using tokens to support duplicate names
  let privacy = "open"
  if (!common.isStringEmpty(inviteName)) {
    if (inviteName == user.name) {
      res.sendStatus(400)
      return
    }
    invite = true
    privacy = "closed"
  }

  if (common.isStringEmpty(password)) password = null;

  let lobby = new classes.Lobby()
  lobby.name = name
  lobby.description = description
  lobby.password = password
  lobby.privacy = privacy

  if (invite) {
    lobby.setFlag("invite")
  }

  let game = new Game(null, fieldSize)

  if (opponentStart == "true") {
    lobby.setFlag("playerinverse")
    game.switchPlayers()
  }

  lobby.game = game.toString()

  lobby = await sql.createLobby(lobby)

  let ownCorrelation = new classes.Correlation()
  ownCorrelation.lobbytoken = lobby.token
  ownCorrelation.usertoken = user.token
  ownCorrelation.invite = false
  await sql.createCorrelation(ownCorrelation)

  let users = await sql.getUsers()
  if (!users) users = []
  if (invite) {
    let filteredusers = users.filter(function (user) {
      return (user.name == inviteName)
    })
    if (filteredusers[0]) {
      let inviteCorrelation = new classes.Correlation()
      inviteCorrelation.lobbytoken = lobby.token
      inviteCorrelation.usertoken = filteredusers[0].token
      inviteCorrelation.invite = true
      await sql.createCorrelation(inviteCorrelation)
    }
  }

  lobby = common.extendLobbyInfo(await sql.getLobbyByToken(lobby.token), user, users)

  res.status(201)
  res.send(JSON.stringify(lobby))
})

module.exports = router
