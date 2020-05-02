const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/leaveLobby', async function (req, res) {

  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let lobbytoken = req.body.lobbytoken
  let lobby = await sql.getLobbyByToken(lobbytoken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  let correlation = lobby.correlations.filter(function (correlation) { return (correlation.usertoken == user.token) })[0]
  if (!correlation) {
    res.sendStatus(400)
    return
  }
  await sql.deleteCorrelation(correlation)

  lobby = await sql.getLobbyByToken(lobby.token)
  //delete lobby if there are no more users in it or if the only correlation is an invite
  if (lobby.correlations.length == 0 || (lobby.correlations.length == 1 && lobby.correlations[0].invite)) {
    sql.deleteLobby(lobby)
  } else {
    // indicated that a player left from the lobby
    // after this flag is set the lobby should no longer be visible or accessible
    lobby.setFlag("left")
    sql.updateLobby(lobby)
  }

  res.sendStatus(200)
})

module.exports = router
