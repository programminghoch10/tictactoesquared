const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')
const Game = require('../../docs/scripts/game.js')

router.post('/api/getLobbies', async function (req, res) {

  let privacyFilter = req.body.privacy
  let fieldSizeFilter = req.body.fieldSize
  let nameFilter = req.body.name
  let hasPasswordFilter = req.body.hasPassword
  let usertokenFilter = req.body.usertoken

  let ownTokenFilter = req.body.ownToken
  let ownJoinedOnlyFilter = (req.body.joinedOnly == "true")
  let ownInvitedOnlyFilter = (req.body.invitedOnly == "true")

  if (!common.isStringEmpty(ownTokenFilter)) {
    sql.updateUserLastActivity(ownTokenFilter)
  }

  //TODO: adapt to not leak data
  if (privacyFilter == null) {
    if (!(ownJoinedOnlyFilter || ownInvitedOnlyFilter)) privacyFilter = "open"
  }

  let lobbies = await sql.getLobbies()
  if (!lobbies) {
    res.sendStatus(204)
    return
  }

  if (!common.isStringEmpty(privacyFilter)) {
    lobbies = lobbies.filter(function (lobby) { return lobby.privacy == privacyFilter })
  }

  if (fieldSizeFilter != null) {
    lobbies = lobbies.filter(function (lobby) {
      return lobby.game.substring(0, lobby.game.indexOf("-")) == fieldSizeFilter
    })
  }

  if (!common.isStringEmpty(nameFilter)) {
    lobbies = lobbies.filter(function (lobby) { return lobby.name == nameFilter })
  }

  if (hasPasswordFilter != null) {
    lobbies = lobbies.filter(function (lobby) {
      return hasPasswordFilter == !common.isStringEmpty(lobby.password)
    })
  }

  if (!common.isStringEmpty(usertokenFilter)) {
    lobbies = lobbies.filter(function (lobby) {
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

  if (!common.isStringEmpty(ownTokenFilter) && !(ownJoinedOnlyFilter || ownInvitedOnlyFilter)) {
    lobbies = lobbies.filter(function (lobby) {
      let containsOwnToken = false
      for (let i = 0; i < lobby.correlations.length; i++) {
        const correlation = lobby.correlations[i]
        if (correlation.usertoken == ownTokenFilter) {
          containsOwnToken = true
          break
        }
      }
      return !containsOwnToken
    })
  }

  if (!common.isStringEmpty(ownTokenFilter) && (ownJoinedOnlyFilter || ownInvitedOnlyFilter)) {
    lobbies = lobbies.filter(function (lobby) {
      let containsOwnToken = false
      for (let i = 0; i < lobby.correlations.length; i++) {
        const correlation = lobby.correlations[i]
        if (correlation.usertoken == ownTokenFilter) {
          containsOwnToken = true
          break
        }
      }
      return containsOwnToken
    })
    if (ownJoinedOnlyFilter) {
      lobbies = lobbies.filter(function (lobby) {
        let joined = false
        for (let i = 0; i < lobby.correlations.length; i++) {
          const correlation = lobby.correlations[i]
          if (correlation.usertoken == ownTokenFilter
            && correlation.invite == false) {
            joined = true
            break
          }
        }
        return joined
      })
    }
    if (ownInvitedOnlyFilter) {
      lobbies = lobbies.filter(function (lobby) {
        let invited = false
        for (let i = 0; i < lobby.correlations.length; i++) {
          const correlation = lobby.correlations[i]
          if (correlation.usertoken == ownTokenFilter
            && correlation.invite == true) {
            invited = true
            break
          }
        }
        return invited
      })
    }
    for (let i = 0; i < lobbies.length; i++) {
      let game = new Game();
      game.fromString(lobbies[i].game)
      lobbies[i].isyourturn = (common.getPlayer(lobbies[i], usertokenFilter) == game.currentPlayer)
    }
  }

  let users = await sql.getUsers();

  for (let i = 0; i < lobbies.length; i++) {
    lobbies[i].password = ""
    lobbies[i].ownername = users.filter(function (user) {
      return (user.token == lobbies[i].correlations[0].usertoken)
    })[0].name
    try {
      if (!common.isStringEmpty(ownTokenFilter)) {
        lobbies[i].opponentname = users.filter(function (user) {
          let isUserCorrelated = false
          for (let j = 0; j < lobbies[i].correlations.length; j++) {
            if (user.token == lobbies[i].correlations[j].usertoken) isUserCorrelated = true
          }
          return isUserCorrelated
        }).filter(function (user) {
          return (user.token != ownTokenFilter)
        })[0].name
      }
    } catch { }
  }

  if (lobbies.length == 0) {
    res.status(204)
  } else {
    res.status(200)
  }

  res.send(JSON.stringify(lobbies))
})

module.exports = router
