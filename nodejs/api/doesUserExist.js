const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/doesUserExist', async function (req, res) {
  let userName = req.body.userName

  if (common.isStringEmpty(userName)) {
    res.sendStatus(400)
    return
  }

  // prevents creation of two users with the same name
  // TODO: implement some sort of differentiation with the token for two users with the name to exist
  let users = await sql.getUsers()
  if (users) {
    users = users.filter(function (user) { return user.name == userName })
    if (users.length > 0) {
      res.sendStatus(302)
      return
    }
  }

  res.sendStatus(404)
})

module.exports = router
