const express = require('express')
let router = express.Router()

const common = require('./common.js')
const classes = require('./classes.js')
const sql = require('./sql.js')

router.post('/createUser', async function(req, res) {
    const name = req.body.name

    if (name == undefined || common.isStringEmpty(name)) {
        res.sendStatus(400)
        return
    }

    // create a new user
    let user = new classes.User()
    user.name = name

    // create a new user in the database
    await sql.createUser(user)

    res.send(JSON.stringify(user))
})

module.exports = router