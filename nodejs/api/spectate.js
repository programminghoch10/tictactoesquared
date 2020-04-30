const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/spectate', async function (req, res) {
  let lobbyToken = req.body.lobbyToken
  let userToken = req.body.userToken

  // if lobby exist
  let lobby = await sql.getLobbyByToken(lobbyToken)
  if (!lobby) {
    res.sendStatus(400)
    return
  }

  if (userToken) {
    sql.updateUserLastActivity(userToken)
    let game = new Game();
    game.fromString(lobby.game)
    lobby.isyourturn = (common.getPlayer(lobby, userToken) == game.currentPlayer)
    try {
      let users = await sql.getUsers();
      lobby.opponentname = users.filter(function (user) {
        let isUserCorrelated = false
        for (let j = 0; j < lobby.correlations.length; j++) {
          if (user.token == lobby.correlations[j].usertoken) isUserCorrelated = true
        }
        return isUserCorrelated
      }).filter(function (user) {
        return (user.token != userToken)
      })[0].name
    } catch { }
  }

  res.status(200)
  res.send(lobby)
})

module.exports = router
