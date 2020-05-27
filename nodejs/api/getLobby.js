const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobby', async function (req, res) {

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

  lobby = common.extendLobbyInfo(lobby, user, await sql.getUsers())

  res.send(JSON.stringify(lobby))
})

module.exports = router
