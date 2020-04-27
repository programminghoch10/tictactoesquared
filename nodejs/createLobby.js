const express = require('express')
let router = express.Router()

const common = require('./common.js')
const classes = require('./classes.js')
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

        //TODO: invite the player
    }

    let lobby = new classes.Lobby()
    lobby.name = name
    lobby.description = description
    lobby.password = password

    sql.createLobby(lobby)

    res.send(JSON.stringify(lobby))
})

module.exports = router