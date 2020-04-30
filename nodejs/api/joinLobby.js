const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

const USER_LIMIT = common.USER_LIMIT

router.post('/api/joinLobby', async function (req, res) {

  let lobbytoken = req.body.lobbytoken
  let usertoken = req.body.usertoken
  let password = req.body.password

  let user = await sql.getUserByToken(usertoken)

  if (!user) {
    res.sendStatus(400)
    return
  }

  let lobby = await sql.getLobbyByToken(lobbytoken)

  if (!lobby) {
    res.sendStatus(400)
    return
  }

  sql.updateUserLastActivity(usertoken)

  // limit max lobbies per user
  if (user.correlations) {
    if (user.correlations.length > USER_LIMIT) {
      res.sendStatus(429)
      return
    }
  }

  if (lobby.password != null && password != lobby.password) {
    res.sendStatus(401)
    return
  }

  //check if closed with invite and check if that is the user who recieved the invite
  if (lobby.correlations[1]) {
    if ((lobby.privacy == "closed" && lobby.correlations[1].invite) && lobby.correlations[1].usertoken != usertoken) {
      res.sendStatus(401)
      return
    }
  }

  //check if lobby full
  if (lobby.correlations.length == 2) {
    res.sendStatus(406)
    return
  }

  let correlation = await sql.getCorrelation(user.token, lobby.token);
  if (correlation) {
    correlation.invite = false
    correlation = await sql.updateCorrelation(correlation)
  } else {
    correlation = new classes.Correlation();
    correlation.lobbytoken = lobby.token
    correlation.usertoken = user.token
    correlation.invite = false
    correlation = await sql.createCorrelation(correlation)
  }

  if (lobby.privacy != "closed") {
    lobby.privacy = "closed"
    await sql.updateLobby(lobby)
  }

  res.sendStatus(202)
})

module.exports = router
