const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobby', async function (req, res) {
  let token = req.body.token

  let lobby = await sql.getLobbyByToken(token)

  if (!lobby) {
    res.sendStatus(400)
    return
  }

  lobby.password = ""

  res.send(JSON.stringify(lobby))
})

module.exports = router
