/*
 * Needs to be declared in sqllogin.js:
 * module.exports = {
 *  hostname: "***",
 *  username: "***",
 *  password: "***",
 *  database: "***",
 * }
 */

const classes = require("./classes.js")
const common = require("./common.js")

var mysql;
var pool; //mysql connection pool
const sqltimeout = 10000; //10s
const usertimeout = 60 * 60 * 24 * 31; //in seconds
const lobbytimeout = 60 * 60 * 24 * 14; //in seconds
const lobbycreatetimeout = 60 * 60 * 24 * 5 //in seconds, when a new created but never used lobby gets deleted
const SQLDEBUG = true;

function init() {
  let logindata = require('./sqllogin.js')

  mysql = require('mysql2/promise');

  pool = mysql.createPool({
    host: logindata.hostname,
    user: logindata.username,
    password: logindata.password,
    database: logindata.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  if (SQLDEBUG) console.log("SQL Connection initialized")

  // dbreset();

  /*con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to sql!");
  });*/
  //no inital connect needed, because a query automatically starts the connection
  /*con.on('error', function(err) {
    //console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      //init();
      //no automatic reconnect, because a query automatically starts a connection
    } else {
      throw err;
    }
  });*/
}

async function dbreset() {
  console.log("Resetting database")
  let tables = ["lobbies", "users", "correlations"];
  for (let i = 0; i < tables.length; i++) {
    await rawQuery("DELETE FROM " + tables[i]);
  }
  console.log("Database reset finished!")
}

async function cleanUp() {
  //cleans users and lobbies which are overdue
  if (SQLDEBUG) console.log("Performing cleanup");
  let now = common.getTime();
  let lobbies = await getLobbies();
  if (lobbies) {
    for (let i = 0; i < lobbies.length; i++) {
      if (lobbies[i].timeout <= now) deleteLobby(lobbies[i]);
    }
  }
  let users = await getUsers();
  if (users) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].timeout <= now) deleteUser(users[i]);
    }
  }
}

async function rawQuery(query) {
  if (SQLDEBUG) console.log("Querying: " + query)
  return (await pool.query(query))[0];
}

async function getUserByToken(token) {
  let result = await getByToken("users", token);
  if (!result) return false;
  return await convertSqlToUser(result);
}

async function getUserBySecret(secret) {
  if (secret == "") return false;
  if (SQLDEBUG) console.log("Searching users for secret: " + secret);
  let results = (await pool.query({
    sql: "SELECT * FROM users WHERE `secret`=?",
    timeout: sqltimeout,
    values: [secret]
  }))[0];
  if (results.length != 1) return false;
  return await convertSqlToUser(results[0]);
}

async function getUsers() {
  let results = await getAll("users");
  let correlations = await getCorrelations();
  if (results.length == 0) return false;
  results = await Promise.all(results.map(async function (result) {
    return _convertSqlToUser(result, correlations);
  }));
  return results;
}

async function createUser(user) {
  if (user.constructor.name != classes.User.name) return false;
  user.creationtime = common.getTime();
  user.lastacttime = user.creationtime;
  user.timeout = user.lastacttime + usertimeout;
  user.token = common.hash("T" + user.name + user.creationtime + Math.random());
  user.secret = common.hash("S" + user.creationtime + user.name + Math.random());
  user.lobbytokens = "";
  user.lobbyinvitetokens = "";
  if (SQLDEBUG) console.log("Adding user " + user.name + " to database.");
  pool.query({
    sql: "INSERT INTO `users` (token, secret, name, creationtime, lastacttime, timeout) \
     VALUES (?, ?, ?, ?, ?, ?)",
    timeout: sqltimeout,
    values: [user.token, user.secret, user.name, user.creationtime, user.lastacttime, user.timeout]
  });
  return await getUserByToken(user.token);
}

async function updateUserLastActivityByToken(token) {
  return await updateUserLastActivity("token", token)
}

async function updateUserLastActivityBySecret(secret) {
  return await updateUserLastActivity("secret", secret)
}

async function updateUserLastActivity(type, value) {
  if (common.isStringEmpty("value") || !(type == "secret" || type == "token")) return false;
  let lastacttime = common.getTime();
  let timeout = lastacttime + usertimeout;
  pool.query({
    sql: "UPDATE `users` \
      SET `lastacttime`=?, `timeout`=? \
      WHERE ??=?",
    timeout: sqltimeout,
    values: [lastacttime, timeout, type, value]
  });
  return true;
}

async function updateUser(user) {
  if (user.constructor.name != classes.User.name) return false;
  let olduser = await getUserByToken(user.token);
  if (!olduser) return false
  user.creationtime = olduser.creationtime;
  user.lastacttime = common.getTime();
  user.timeout = user.lastacttime + usertimeout;
  user.id = olduser.id;
  user.secret = olduser.secret;
  if (SQLDEBUG) console.log("Updating user " + user.name);
  pool.query({
    sql: "UPDATE `users` \
      SET `lastacttime`=?, `name`=?, `timeout`=? \
      WHERE `token`=?",
    timeout: sqltimeout,
    values: [user.lastacttime, user.name, user.timeout, user.token]
  });
  return user;
}

async function deleteUser(user) {
  if (user.constructor.name != classes.User.name) return false;
  if (common.isStringEmpty(user.token)) return false;
  if (SQLDEBUG) console.log("Deleting user " + user.name)
  pool.query({
    sql: "DELETE FROM users WHERE `token`=?",
    timeout: sqltimeout,
    values: [user.token]
  });
  deleteCorrelationsByUserToken(user.token)
  return true;
}

async function getLobbyByToken(token) {
  let result = await getByToken("lobbies", token);
  if (!result) return false;
  return await convertSqlToLobby(result);
}

async function getLobbies() {
  let results = await getAll("lobbies");
  let correlations = await getCorrelations();
  if (results.length == 0) return false;
  results = await Promise.all(results.map(async function (result) {
    return _convertSqlToLobby(result, correlations);
  }));
  return results;
}

async function createLobby(lobby) {
  if (lobby.constructor.name != classes.Lobby.name) return false;
  lobby.creationtime = common.getTime();
  lobby.lastacttime = lobby.creationtime;
  lobby.timeout = lobby.lastacttime + lobbycreatetimeout;
  lobby.token = common.hash(lobby.name + lobby.creationtime);
  if (!checkPrivacyFlag(lobby.privacy)) return false;
  if (SQLDEBUG) console.log("Adding lobby " + lobby.name + " to database.");
  await pool.query({
    sql: "INSERT INTO `lobbies` ( \
      token, name, game, gameflags, description, password, \
      privacy, creationtime, lastacttime, timeout) \
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    timeout: sqltimeout,
    values: [lobby.token, lobby.name, lobby.game, lobby.flags, lobby.description, lobby.password,
    lobby.privacy, lobby.creationtime, lobby.lastacttime, lobby.timeout]
  });
  return await getLobbyByToken(lobby.token);
}

async function updateLobbyGame(token, game) {
  let lobby = await getLobbyByToken(token);
  lobby.game = game;
  return await updateLobby(lobby);
}
async function updateLobby(lobby) {
  if (lobby.constructor.name != classes.Lobby.name) return false;
  let oldlobby = await getLobbyByToken(lobby.token);
  lobby.creationtime = oldlobby.creationtime;
  lobby.lastacttime = common.getTime();
  lobby.timeout = lobby.lastacttime + lobbytimeout;
  lobby.id = oldlobby.id;
  if (!checkPrivacyFlag(lobby.privacy)) return false;
  if (SQLDEBUG) console.log("Updating lobby " + lobby.name);
  pool.query({
    sql: "UPDATE `lobbies` \
      SET `name`=?, `game`=?, `gameflags`=?, \
      `description`=?, `password`=?, \
      `privacy`=?, `lastacttime`=?, `timeout`=? \
      WHERE `token`=?",
    timeout: sqltimeout,
    values: [lobby.name, lobby.game, lobby.flags, lobby.description, lobby.password,
    lobby.privacy, lobby.lastacttime, lobby.timeout, lobby.token]
  });
  return lobby;
}

async function deleteLobby(lobby) {
  if (lobby.constructor.name != classes.Lobby.name) return false;
  if (common.isStringEmpty(lobby.token)) return false;
  if (SQLDEBUG) console.log("Deleting Lobby " + lobby.name);
  pool.query({
    sql: "DELETE FROM lobbies WHERE `token`=?",
    timeout: sqltimeout,
    values: [lobby.token]
  });
  deleteCorrelationsByLobbyToken(lobby.token)
  return true;
}

async function createCorrelation(correlation) {
  if (correlation.constructor.name != classes.Correlation.name) return false;
  if (! await getUserByToken(correlation.usertoken)) return false;
  if (! await getLobbyByToken(correlation.lobbytoken)) return false;
  if (SQLDEBUG) console.log("Adding correlation to database.");
  pool.query({
    sql: "INSERT INTO `correlations` ( \
      usertoken, lobbytoken, invite) \
      VALUES (?, ?, ?)",
    timeout: sqltimeout,
    values: [correlation.usertoken, correlation.lobbytoken, correlation.invite]
  });
  return true;
}

async function updateCorrelation(correlation) {
  if (correlation.constructor.name != classes.Correlation.name) return false;
  if (SQLDEBUG) console.log("Updating correlation.");
  pool.query({
    sql: "UPDATE `correlations` \
      SET `usertoken`=?, `lobbytoken`=?, `invite`=? \
      WHERE `id`=?",
    timeout: sqltimeout,
    values: [correlation.usertoken, correlation.lobbytoken,
    correlation.invite, correlation.id]
  });
  return true;
}

async function deleteCorrelation(correlation) {
  if (correlation.constructor.name != classes.Correlation.name) return false;
  if (SQLDEBUG) console.log("Deleting a correlation");
  pool.query({
    sql: "DELETE FROM correlations WHERE `id`=?",
    timeout: sqltimeout,
    values: [correlation.id]
  });
  return true;
}

async function deleteCorrelationsByUserToken(usertoken) {
  return await deleteCorrelationsByToken("user", usertoken);
}

async function deleteCorrelationsByLobbyToken(lobbytoken) {
  return await deleteCorrelationsByToken("lobby", lobbytoken);
}

async function deleteCorrelationsByToken(type, token) {
  if (token == "" || !(type == "lobby" || type == "user")) return false;
  type = type + "token";
  if (SQLDEBUG) console.log("Deleting correlations where " + type + " is " + token);
  return (await pool.query({
    sql: "DELETE FROM correlations WHERE ??=?",
    timeout: sqltimeout,
    values: [type, token]
  }))[0];
}

async function getCorrelationsByUserToken(usertoken) {
  return await getCorrelationsByToken("user", usertoken);
}

async function getCorrelationsByLobbyToken(lobbytoken) {
  return await getCorrelationsByToken("lobby", lobbytoken);
}

async function getCorrelationsByToken(type, token) {
  if (token == "" || !(type == "lobby" || type == "user")) return false;
  type = type + "token";
  if (SQLDEBUG) console.log("Searching correlations for " + type + ": " + token);
  let correlations = (await pool.query({
    sql: "SELECT * FROM correlations WHERE ??=?",
    timeout: sqltimeout,
    values: [type, token]
  }))[0];
  for (let i = 0; i < correlations.length; i++) {
    correlations[i] = convertSqlToCorrelation(correlations[i]);
  }
  return correlations;
}

async function getCorrelations() {
  let results = await getAll("correlations");
  if (results.length == 0) return false;
  for (let i = 0; i < results.length; i++) {
    results[i] = convertSqlToCorrelation(results[i]);
  }
  return results;
}

async function getCorrelation(usertoken, lobbytoken) {
  if (common.isStringEmpty(usertoken) || common.isStringEmpty(lobbytoken)) return false;
  if (SQLDEBUG) console.log("Searching for correlation with usertoken: " + usertoken + " and lobbytoken: " + lobbytoken);
  let results = (await pool.query({
    sql: "SELECT * FROM correlations WHERE `usertoken`=? AND `lobbytoken`=?",
    timeout: sqltimeout,
    values: [usertoken, lobbytoken]
  }))[0];
  if (results.length != 1) return false;
  return convertSqlToCorrelation(results[0]);
}

async function getByToken(table, token) {
  if (token == "" || !(table == "lobbies" || table == "users")) return false;
  if (SQLDEBUG) console.log("Searching " + table + " with token: " + token);
  let results = (await pool.query({
    sql: "SELECT * FROM ?? WHERE `token`=?",
    timeout: sqltimeout,
    values: [table, token]
  }))[0];
  if (results.length != 1) return false;
  return results[0];
}

async function getAll(table) {
  return (await pool.query({
    sql: "SELECT * FROM ??",
    timeout: sqltimeout,
    values: [table]
  }))[0];
}

function checkPrivacyFlag(privacy) {
  switch (privacy) {
    case "open":
    case "closed":
    case "invisible":
      return true;
    default:
      return false;
  }
}

async function convertSqlToUser(row) {
  let user = new classes.User();
  user.id = row.id;
  user.token = row.token;
  user.secret = row.secret;
  user.name = row.name;
  user.creationtime = row.creationtime;
  user.lastacttime = row.lastacttime;
  user.timeout = row.timeout;
  user.correlations = await getCorrelationsByUserToken(user.token);
  return user;
}

function _convertSqlToUser(row, correlations) {
  let user = new classes.User();
  user.id = row.id;
  user.token = row.token;
  user.secret = row.secret;
  user.name = row.name;
  user.creationtime = row.creationtime;
  user.lastacttime = row.lastacttime;
  user.timeout = row.timeout;
  if (correlations) {
    user.correlations = correlations.filter(function (correlation) {
      return correlation.usertoken == user.token;
    });
  }
  return user;
}

async function convertSqlToLobby(row) {
  let lobby = new classes.Lobby();
  lobby.id = row.id;
  lobby.token = row.token;
  lobby.game = row.game;
  lobby.flags = row.gameflags;
  lobby.name = row.name;
  lobby.description = row.description;
  lobby.password = row.password;
  lobby.privacy = row.privacy;
  lobby.creationtime = row.creationtime;
  lobby.lastacttime = row.lastacttime;
  lobby.timeout = row.timeout;
  lobby.correlations = await getCorrelationsByLobbyToken(lobby.token);
  return lobby;
}

function _convertSqlToLobby(row, correlations) {
  let lobby = new classes.Lobby();
  lobby.id = row.id;
  lobby.token = row.token;
  lobby.game = row.game;
  lobby.flags = row.gameflags;
  lobby.name = row.name;
  lobby.description = row.description;
  lobby.password = row.password;
  lobby.privacy = row.privacy;
  lobby.creationtime = row.creationtime;
  lobby.lastacttime = row.lastacttime;
  lobby.timeout = row.timeout;
  if (correlations) {
    lobby.correlations = correlations.filter(function (correlation) {
      return correlation.lobbytoken == lobby.token;
    });
  }
  return lobby;
}


function convertSqlToCorrelation(row) {
  let correlation = new classes.Correlation();
  correlation.id = row.id;
  correlation.usertoken = row.usertoken;
  correlation.lobbytoken = row.lobbytoken;
  correlation.invite = row.invite;
  return correlation;
}

module.exports = {
  init: init,
  rawQuery: rawQuery,
  cleanUp: cleanUp,

  getUsers: getUsers,
  getUserByToken: getUserByToken,
  getUserBySecret: getUserBySecret,
  createUser: createUser,
  updateUser: updateUser,
  updateUserLastActivityByToken: updateUserLastActivityByToken,
  updateUserLastActivityBySecret: updateUserLastActivityBySecret,
  deleteUser: deleteUser,

  getLobbies: getLobbies,
  getLobbyByToken: getLobbyByToken,
  createLobby: createLobby,
  updateLobby: updateLobby,
  updateLobbyGame: updateLobbyGame,
  deleteLobby: deleteLobby,

  getCorrelationsByLobbyToken: getCorrelationsByLobbyToken,
  getCorrelationsByUserToken: getCorrelationsByUserToken,
  getCorrelation: getCorrelation,
  createCorrelation: createCorrelation,
  updateCorrelation: updateCorrelation,
  deleteCorrelation: deleteCorrelation,
}
