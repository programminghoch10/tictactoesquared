const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobbies', async function(req, res) {

    let privacyFilter = req.body.privacy
    let fieldSizeFilter = req.body.fieldSize
    let nameFilter = req.body.name
    let hasPasswordFilter = req.body.hasPassword
    let usertokenFilter = req.body.usertoken

    let lobbies = await sql.getLobbies()
    if (!lobbies) {
        res.sendStatus(500)
        return
    }
    
    if (!common.isStringEmpty(privacyFilter)) {
        lobbies = lobbies.filter(function(lobby) {return lobby.privacy == privacyFilter})
    }

    if (fieldSizeFilter != null) {
        lobbies = lobbies.filter(function(lobby) {
            return lobby.game.substring(0, lobby.game.indexOf("-")) == fieldSizeFilter
        })
    }

    if (!common.isStringEmpty(nameFilter)) {
        lobbies = lobbies.filter(function(lobby) {return lobby.name == nameFilter})
    }

    if (hasPasswordFilter != null) {
        lobbies = lobbies.filter(function(lobby) {
            return hasPasswordFilter == !common.isStringEmpty(lobby.password)
        })
    }

    if (!common.isStringEmpty(usertokenFilter)) {
        lobbies = lobbies.filter(function(lobby) {
            let containsUserToken = false
            for (let i = 0; i < lobby.correlations.length; i++) {
                const correlation = lobby.correlations[i]
                if (correlation.usertoken == usertokenFilter) {
                    containsUserToken = true
                    break
                }
            }
            return containsUserToken
        })
    }

    for (let i = 0; i < lobbies.length; i++) {
        lobbies[i].password = ""
    }

    if (lobbies.length == 0) {
        res.status(204)
    } else {
        res.status(200)
    }

    res.send(JSON.stringify(lobbies))
})

module.exports = router