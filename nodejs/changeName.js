const express = require('express')
let router = express.Router()

const common = require('./common.js')
const sql = require('./sql.js')

router.post('/changeName', async function(req, res) {
    let token = req.body.token
    let name = req.body.name // the new name

    let user = await sql.getUserByToken(token)

    console.log(user)

    if (!user) {
        res.sendStatus(400)
        return
    }

    // change user name in database

    res.send(user.name)
})

module.exports = router