const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/getUser', async function (req, res) {

  let secret = req.body.secret
  let thisUser = await sql.getUserBySecret(secret)
  if (!thisUser) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  let token = req.body.token

  let user = await sql.getUserByToken(token)

  if (!user) {
    res.sendStatus(400)
    return
  }

  user = common.sanitizeUser(user)

  res.send(JSON.stringify(user))
})

module.exports = router
