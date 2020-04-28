const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/createLobby', async function(req, res) {
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
    if (!common.isStringEmpty(inviteToken)) {
        privacy = "closed"
    }

    let lobby = new classes.Lobby()
    lobby.name = name
    lobby.description = description
    lobby.password = password
    lobby.privacy = privacy

    lobby = await sql.createLobby(lobby)

    let ownCorrelation = new classes.Correlation()
    ownCorrelation.lobbytoken = lobby.token
    ownCorrelation.usertoken = ownToken
    ownCorrelation.invite = false
    sql.createCorrelation(ownCorrelation)

    if (!common.isStringEmpty(inviteToken)) {
        let inviteCorrelation = new classes.Correlation()
        inviteCorrelation.lobbytoken = lobby.token
        inviteCorrelation.usertoken = inviteToken
        inviteCorrelation.invite = true
        sql.createCorrelation(inviteCorrelation)
    }

    lobby = sql.getLobbyByToken(lobby.token)

    res.send(JSON.stringify(lobby))
})

module.exports = router