const express = require('express')
let router = express.Router()

const common = require('./common.js')

router.post('/requestPlayerToken', function(req, res) {
    const name = req.body.name

    if (name == undefined) {
        res.sendStatus(400)
        return
    }

    let token = common.hash(name + common.getTime())

    // add player to database

    res.send(token)
})

module.exports = router