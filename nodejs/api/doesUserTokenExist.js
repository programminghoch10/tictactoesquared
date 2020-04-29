const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/doesUserTokenExist', async function (req, res) {
  let token = req.body.token

  let user = await sql.getUserByToken(token)

  if (!user) {
    res.send("false")
    return
  }

  res.send("true")
})

module.exports = router
