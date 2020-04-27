const express = require('express')
let router = express.Router()

const common = require('./common.js')
const sql = require('./sql.js')

router.post('/createLobby', async function(req, res) {
    let name = req.body.name
    let description = req.body.description
    let password = req.body.password
    let ownToken = req.body.ownToken
    let inviteToken = req.body.inviteToken

    console.log(req.body)

    if (common.isStringEmpty(name)) {
        res.sendStatus(400)
        return
    }
    
    // if token does not exist
    let user = await sql.getUserByToken(ownToken)
    if (!user) {
        res.sendStatus(400)
        return
    }

    // if invite token is not null
    // the lobby's privacy is closed
    let privacy = "open"
    if (inviteToken != null) {
        privacy = "closed"

        // invite the player
    }

    // create lobby token
    let token = common.hash(name + common.getTime())

    // TODO: add lobby to database

    res.send(token)
})

module.exports = router