const express = require('express')
let router = express.Router()

const common = require('../common.js')
const classes = require('../classes.js')
const sql = require('../sql.js')

router.post('/api/getLobbies', async function (req, res) {

  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  sql.updateUserLastActivityBySecret(secret)

  //FILTERS:
  //all filters only apply if their value is not null
  let privacyFilter = req.body.privacy //only lobbies with this privacy setting
  let fieldSizeFilter = req.body.fieldSize //only lobbies with this fieldSize
  let lobbyNameFilter = req.body.lobbyName //only lobbies with this name
  let userNameFilter = req.body.userName //only lobbies which contain users with this name
  let userCountFilter = req.body.userCount //only lobbies with this user count
  let hasPasswordFilter = req.body.hasPassword //only lobbies which match on whether they have a password (only true and false allowed)
  let usertokenFilter = req.body.usertoken //only lobbies which DO NOT contain correlations with this usertoken

  let ownToken = req.body.ownToken //only lobbies which DO contain correlations with this usertoken
  let ownJoinedOnlyFilter = (req.body.joinedOnly == "true") //only in combination with ownToken, only lobbies this user has joined
  let ownInvitedOnlyFilter = (req.body.invitedOnly == "true") //only in combination with ownToken, only lobbies which this user has been invited to


  //TODO: adapt to not leak data
  if (privacyFilter == null) {
    if (!(ownJoinedOnlyFilter || ownInvitedOnlyFilter)) privacyFilter = "open"
  }

  let lobbies = await sql.getLobbies()
  if (!lobbies) {
    res.sendStatus(204)
    return
  }
  let users = await sql.getUsers();
  if (!users) users = []

  // filter for privacy
  if (!common.isStringEmpty(privacyFilter)) {
    lobbies = lobbies.filter(function (lobby) { return lobby.privacy == privacyFilter })
  }

  // filter for fieldSize
  if (fieldSizeFilter != null) {
    lobbies = lobbies.filter(function (lobby) {
      return lobby.game.substring(0, lobby.game.indexOf("-")) == fieldSizeFilter
    })
  }

  //filter for lobby name
  if (!common.isStringEmpty(lobbyNameFilter)) {
    lobbies = lobbies.filter(function (lobby) { return lobby.name.includes(lobbyNameFilter) })
  }

  //filter for user name
  if (!common.isStringEmpty(userNameFilter)) {
    let searchusers = users.filter(function (user) { return (user.name.includes(userNameFilter)) })
    if (searchusers) {
      lobbies.filter(function (lobby) {
        if (!lobby.correlations) return false
        for (let i = 0; i < lobby.correlations.length; i++) {
          let correlation = lobby.correlations[i];
          let usersinthiscorrelation = searchusers.filter(function (user) { return (user.token == correlation.usertoken) })
          for (let j = 0; j < usersinthiscorrelation.length; j++) {
            let user = usersinthiscorrelation[j];
            if (user.name.includes(userNameFilter)) return true
          }
        }
        return false
      })
    } else {
      lobbies = []
    }
  }

  // filter for user count
  if (!common.isStringEmpty(userCountFilter)) {
    lobbies = lobbies.filter(function (lobby) { return (lobby.correlations ? lobby.correlations : []).length == userCountFilter })
  }

  //filter whether lobby has password
  if (hasPasswordFilter != null) {
    lobbies = lobbies.filter(function (lobby) {
      return hasPasswordFilter == !common.isStringEmpty(lobby.password)
    })
  }

  // filter out lobbies with this token
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

  //only retain lobbies with this token and additionally filter for joined and invited lobbies
  if (!common.isStringEmpty(ownToken)) {
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

  //extend lobby info for every remaining lobby
  lobbies = await Promise.all(lobbies.map(async function (lobby) {
    return common.extendLobbyInfo(lobby, user, users)
  }));

  //resort lobbies pimarily after last activity (new to old) and secondarily after their id (new to old)
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
