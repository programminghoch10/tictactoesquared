const express = require('express')
let router = express.Router()

const common = require('../common.js')
const Game = require('../../docs/scripts/game.js')
const ai = require('../../docs/scripts/ai.js')

router.post('/api/requestai', async function (req, res) {
  let gameString = req.body.game
  let difficulty = parseInt(req.body.difficulty) || 3

  if (common.isStringEmpty(gameString)) {
    res.sendStatus(400)
    return
  }

  let size = gameString.substring(0, gameString.indexOf("-"))
  let game = new Game(null, size)
  game.fromString(gameString)

  ai(game, difficulty)

  gameString = game.toString()
  // console.log(gameString)

  res.status(200)
  res.send(gameString)
})

module.exports = router
