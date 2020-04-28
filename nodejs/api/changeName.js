const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/changeName', async function(req, res) {
    let token = req.body.token
    let name = req.body.name // the new name

    if (common.isStringEmpty(name)) {
        res.sendStatus(400)
        return
    }

    let user = await sql.getUserByToken(token)

    if (!user) {
        res.sendStatus(400)
        return
    }

    user.name = name

    sql.updateUser(user)

    res.send(user.name)
})

module.exports = router