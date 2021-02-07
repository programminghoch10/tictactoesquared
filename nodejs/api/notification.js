const express = require('express')
let router = express.Router()

const common = require('../common.js')
const sql = require('../sql.js')

router.post('/api/notification', async function (req, res) {
  let secret = req.body.secret
  let user = await sql.getUserBySecret(secret)
  if (!user) {
    res.sendStatus(401)
    return
  }
  //sql.updateUserLastActivityBySecret(secret) //do not count notification check as activity


  //TODO: get unplayed games

  // get all lobbies
  let lobbies = await sql.getLobbies()
  if (!lobbies) {
    res.sendStatus(204)
    return
  }

  //get all users, we need it later for extendLobbyInfo
  let users = sql.getUsers()

  //define ownToken for filtering
  ownToken = user.token

  //check for invites
  let invitedLobbies = lobbies.filter(function (lobby) {
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


  //only keep lobbies with this token
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

  //filter for joined lobbies
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

  //filter for lobbies where it's this user's turn
  lobbies = lobbies.filter(function (lobby) {
    lobby = common.extendLobbyInfo(lobby, user, users)
    return !!lobby.isyourturn
  })

  lobbies = lobbies.map(lobby => common.extendLobbyInfo(lobby, user, users));
  invitedLobbies = invitedLobbies.map(lobby => common.extendLobbyInfo(lobby, user, users));

  if (invitedLobbies.length == 0 && lobbies.length == 0) {
    res.status(204)
  } else {
    res.status(200)
  }

  res.send(
    {
      invitedLobbies: invitedLobbies,
      hasInvitedLobbies: invitedLobbies.length > 0,
      invitedLobbiesCount: invitedLobbies.length,
      unplayedLobbies: lobbies,
      hasUnplayedLobbies: lobbies.length > 0,
      unplayedLobbiesCount: lobbies.length,
    }
  )

})

module.exports = router
