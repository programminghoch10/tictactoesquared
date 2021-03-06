const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

const USER_LIMIT = common.USER_LIMIT
const MIN_FIELD_SIZE = 2
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
  let spectatable = req.body.spectatable

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

  // check if the a string is too large
  if (name.length > 50 || description.length > 250) {
    res.sendStatus(413)
    return
  }

  if (password != null && password.length > 20) {
    res.sendStatus(413)
    return
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

  let users = await sql.getUsers()
  if (!users) users = []
  if (invite) {
    lobby.setFlag("invite")
    if (!users.find(user => user.name == inviteName)) {
      res.sendStatus(400)
      return
    }
  }

  let game = new Game(null, fieldSize)

  if (opponentStart == "true") {
    lobby.setFlag("playerinverse")
    game.switchPlayers()
  }

  if (spectatable == "true") {
    lobby.setFlag("spectatable")
  }

  lobby.game = game.toString()

  lobby = await sql.createLobby(lobby)

  let ownCorrelation = new classes.Correlation()
  ownCorrelation.lobbytoken = lobby.token
  ownCorrelation.usertoken = user.token
  ownCorrelation.invite = false
  await sql.createCorrelation(ownCorrelation)

  if (invite) {
    let inviteuser = users.find(function (user) {
      return (user.name == inviteName)
    })
    if (inviteuser) {
      let inviteCorrelation = new classes.Correlation()
      inviteCorrelation.lobbytoken = lobby.token
      inviteCorrelation.usertoken = inviteuser.token
      inviteCorrelation.invite = true
      await sql.createCorrelation(inviteCorrelation)
    }
  }

  lobby = common.extendLobbyInfo(await sql.getLobbyByToken(lobby.token), user, users)
  lobby = common.sanitizeLobby(lobby)

  res.status(201)
  res.send(JSON.stringify(lobby))
})

module.exports = router
