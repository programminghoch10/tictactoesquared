const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/changeName', async function (req, res) {
  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }

  let name = req.body.name // the new name

  if (common.isStringEmpty(name)) {
    res.sendStatus(400)
    return
  }

  if (user.name == name) {
    res.sendStatus(304)
    return
  }

  // prevents creation of two users with the same name
  // TODO: implement some sort of differentiation with the token for two users with the name to exist
  let users = await sql.getUsers()
  if (users) {
    users = users.filter(function (user) { return user.name == name })
    if (users.length > 0) {
      res.sendStatus(409)
      return
    }
  }

  user.name = name

  sql.updateUser(user)

  res.statusStatus(200)
})

module.exports = router
