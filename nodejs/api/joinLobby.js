const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/joinLobby', async function(req, res) {

    let lobbytoken = req.body.lobbytoken
    let usertoken = req.body.usertoken
    let password = req.body.password

    let user = await sql.getUserByToken(usertoken)

    if (!user) {
        res.sendStatus(400)
        return
    }

    let lobby = await sql.getLobbyByToken(lobbytoken)

    if (!lobby) {
        res.sendStatus(400)
        return
    }

    if (password != lobby.password) {
        res.sendStatus(401)
        return
    }

    let correlation = new classes.Correlation()
    correlation.lobbytoken = lobby.token
    correlation.usertoken = user.token
    correlation.invite = false
    correlation = await sql.createCorrelation(correlation)

    if (lobby.privacy != "closed") {
        lobby.privacy = "closed"
        await sql.updateLobby(lobby)
    }

    res.sendStatus(200)
})

module.exports = router