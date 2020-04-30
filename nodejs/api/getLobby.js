const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/getLobby', async function (req, res) {
  let lobbytoken = req.body.lobbytoken
  let usertoken = req.body.usertoken

  let lobby = await sql.getLobbyByToken(lobbytoken)

  if (!lobby) {
    res.sendStatus(400)
    return
  }

  lobby.password = ""

  if (usertoken) {
    sql.updateUserLastActivity(usertoken)
    let game = new Game();
    game.fromString(lobby.game)
    lobby.isyourturn = (common.getPlayer(lobby, usertoken) == game.currentPlayer)
    try {
      let users = await sql.getUsers();
      lobby.opponentname = users.filter(function (user) {
        let isUserCorrelated = false
        for (let j = 0; j < lobby.correlations.length; j++) {
          if (user.token == lobby.correlations[j].usertoken) isUserCorrelated = true
        }
        return isUserCorrelated
      }).filter(function (user) {
        return (user.token != usertoken)
      })[0].name
    } catch { }
  }

  res.send(JSON.stringify(lobby))
})

module.exports = router
