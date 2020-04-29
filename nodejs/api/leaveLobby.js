const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/leaveLobby', async function (req, res) {
  let lobbytoken = req.body.lobbytoken
  let usertoken = req.body.usertoken

  let lobby = await sql.getLobbyByToken(lobbytoken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  let user = await sql.getUserByToken(usertoken)
  if (!user) {
    res.sendStatus(400)
    return
  }

  await sql.deleteCorrelation(await sql.getCorrelation(user.token, lobby.token))

  lobby = await sql.getLobbyByToken(lobby.token)
  if (lobby.correlations.length == 0) {
    sql.deleteLobby(lobby)
  } else if (lobby.correlations.length == 1 && lobby.correlations[0].invite) {
    sql.deleteCorrelation(await sql.getCorrelation(lobby.correlations[0].usertoken, lobby.correlations[0].lobbytoken))
    sql.deleteLobby(lobby)
  }

  res.sendStatus(200)
})

module.exports = router
