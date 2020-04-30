const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobbies', async function (req, res) {

  let privacyFilter = req.body.privacy
  let fieldSizeFilter = req.body.fieldSize
  let nameFilter = req.body.name
  let hasPasswordFilter = req.body.hasPassword
  let usertokenFilter = req.body.usertoken

  let ownToken = req.body.ownToken
  let ownJoinedOnlyFilter = (req.body.joinedOnly == "true")
  let ownInvitedOnlyFilter = (req.body.invitedOnly == "true")

  if (!common.isStringEmpty(ownToken)) {
    sql.updateUserLastActivity(ownToken)
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

  if (!common.isStringEmpty(ownToken) && !(ownJoinedOnlyFilter || ownInvitedOnlyFilter)) {
    lobbies = lobbies.filter(function (lobby) {
      let containsOwnToken = false
      for (let i = 0; i < lobby.correlations.length; i++) {
        const correlation = lobby.correlations[i]
        if (correlation.usertoken == ownToken) {
          containsOwnToken = true
          break
        }
      }
      return !containsOwnToken
    })
  }

  if (!common.isStringEmpty(ownToken) && (ownJoinedOnlyFilter || ownInvitedOnlyFilter)) {
    lobbies = lobbies.filter(function (lobby) {
      let containsOwnToken = false
      if (!lobby.correlations) return false
      for (let i = 0; i < lobby.correlations.length; i++) {
        const correlation = lobby.correlations[i]
        if (correlation.usertoken == ownToken) {
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
          if (correlation.usertoken == ownToken
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
          if (correlation.usertoken == ownToken
            && correlation.invite == true) {
            invited = true
            break
          }
        }
        return invited
      })
    }
  }

  let users = await sql.getUsers();
  lobbies = await Promise.all(lobbies.map(async function (lobby) {
    return await common.extendLobbyInfo(lobby, ownToken, users)
  }));

  lobbies.sort(function (a, b) {
    let lastactdiff = b.lastacttime - a.lastacttime
    if (lastactdiff == 0) return b.id - a.id
    return lastactdiff
  })

  if (lobbies.length == 0) {
    res.status(204)
  } else {
    res.status(200)
  }

  res.send(JSON.stringify(lobbies))
})

module.exports = router
