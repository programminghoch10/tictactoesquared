const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/createUser', async function (req, res) {
  let name = req.body.name

  if (common.isStringEmpty(name)) {
    res.sendStatus(400)
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

  // check if the name is too long
  if (name.length > 32) {
    res.sendStatus(413)
    return
  }

  //remove spaces around name
  name = name.trim()

  // create a new user
  let user = new classes.User()
  user.name = name

  // create a new user in the database
  await sql.createUser(user)

  // user.name = common.sanitizeString(user.name)

  res.status(201)
  res.send(JSON.stringify(user))
})

module.exports = router
