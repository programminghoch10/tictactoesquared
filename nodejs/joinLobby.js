const express = require('express')
let router = express.Router()

const common = require('./common.js')
const sql = require('./sql.js')

router.post('/doesPlayerTokenExist', async function(req, res) {
    let lobbytoken = req.body.lobbytoken
    let playertoken = req.body.playertoken
    let password = req.body.password

    let player = await sql.getUserByToken(playertoken)

    if (!player) {
        res.sendStatus(400)
        return
    }

    let lobby = await sql.getLobbyByToken(lobbytoken)

    if (!lobby) {
        res.sendStatus(400)
        return
    }

    if (common.hash(password) != lobby.password) {
        res.sendStatus(401)
        return
    }

    // add player to the lobby
    // add lobby to the player

    res.sendStatus(200)
})

module.exports = router