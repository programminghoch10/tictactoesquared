const express = require('express')
let router = express.Router()

const common = require('./common.js')

router.post('/doesPlayerTokenExist', function(req, res) {
    // let token = req.body.token
    res.send("true")
})

module.exports = router