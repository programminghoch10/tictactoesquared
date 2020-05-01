const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/doesUserTokenExist', async function (req, res) {
  let token = req.body.token
  let secret = req.body.secret

  let users = await sql.getUsers()
  if (!users) return false

  let thisuser = users.filter(function (user) { return (user.secret == secret) })[0]
  if (!thisuser) {
    res.sendStatus(401)
    return
  }

  let user = users.filter(function (user) { return (user.token == token) })[0]
  if (!user) {
    res.send("false")
    return
  }

  res.send("true")
})

module.exports = router
