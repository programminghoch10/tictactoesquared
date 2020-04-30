const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobby', async function (req, res) {
  let lobbytoken = req.body.lobbytoken
  let usertoken = req.body.usertoken

  let lobby = await sql.getLobbyByToken(lobbytoken)

  if (!lobby) {
    res.sendStatus(400)
    return
  }

  if (usertoken) {
    sql.updateUserLastActivity(usertoken)
    lobby = await common.extendLobbyInfo(lobby, usertoken)
  }

  res.send(JSON.stringify(lobby))
})

module.exports = router
