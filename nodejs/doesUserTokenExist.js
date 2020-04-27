const express = require('express')
let router = express.Router()

const common = require('./common.js')
const sql = require('./sql.js')

router.post('/doesUserTokenExist', async function(req, res) {
    let token = req.body.token

    let user = sql.getUserByToken(token)

    if (!token) {
        res.send("false")
        return
    }

    res.send("true")
})

module.exports = router