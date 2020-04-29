const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/createLobby', async function (req, res) {
  let name = req.body.name
  let description = req.body.description
  let password = req.body.password
  let fieldSize = req.body.fieldSize
  let ownToken = req.body.ownToken
  let inviteName = req.body.inviteName

  console.log(req.body)

  if (common.isStringEmpty(name)) {
    res.sendStatus(400)
    return
  }

  // if field size is valid
  try {
    let num = parseInt(fieldSize)
    if (num < 3 || num > 5) {
      res.sendStatus(400)
      return
    }
  } catch {
    res.sendStatus(400)
    return
  }

  // if token does not exist
  let user = await sql.getUserByToken(ownToken)
  if (!user) {
    res.sendStatus(400)
    return
  }

  let invite = false
  // if invite name is not null
  // the lobby's privacy is closed
  //TODO: switch to using tokens to support duplicate names
  let privacy = "open"
  if (!common.isStringEmpty(inviteName)) {
    invite = true
    privacy = "closed"
  }

  if (common.isStringEmpty(password)) password = null;

  let lobby = new classes.Lobby()
  lobby.name = name
  lobby.description = description
  lobby.password = password
  lobby.privacy = privacy

  lobby.game = (new Game(null, fieldSize)).toString()

  lobby = await sql.createLobby(lobby)

  let ownCorrelation = new classes.Correlation()
  ownCorrelation.lobbytoken = lobby.token
  ownCorrelation.usertoken = ownToken
  ownCorrelation.invite = false
  await sql.createCorrelation(ownCorrelation)

  if (invite) {
    let users = await sql.getUsers()
    users = users.filter(function (user) {
      return (user.name == inviteName)
    })
    if (users[0]) {
      let inviteCorrelation = new classes.Correlation()
      inviteCorrelation.lobbytoken = lobby.token
      inviteCorrelation.usertoken = users[0].token
      inviteCorrelation.invite = true
      await sql.createCorrelation(inviteCorrelation)
    }
  }

  lobby = await sql.getLobbyByToken(lobby.token)

  res.status(201)
  res.send(JSON.stringify(lobby))
})

module.exports = router
