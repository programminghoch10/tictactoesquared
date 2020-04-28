const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobbies', async function(req, res) {

    let lobbies = await sql.getLobbies()

    if (!lobbies) {
        res.sendStatus(500)
        return
    }
    
    for (let i = 0; i < lobbies.length; i++) {
        lobbies[i].password = ""
    }

    res.send(JSON.stringify(lobbies))
})

module.exports = router