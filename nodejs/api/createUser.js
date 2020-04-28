const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/createUser', async function(req, res) {
    const name = req.body.name

    if (common.isStringEmpty(name)) {
        res.sendStatus(400)
        return
    }

    // prevents creation of two users with the same name
    // TODO: implement some sort of differentiation with the token for two users with the name to exist
    let users = await sql.getUsers()
    users = users.filter(function(user) {return user.name == name})
    if (users.length > 0) {
        res.sendStatus(409)
        return
    }

    // create a new user
    let user = new classes.User()
    user.name = name

    // create a new user in the database
    await sql.createUser(user)

    res.status(201)
    res.send(JSON.stringify(user))
})

module.exports = router