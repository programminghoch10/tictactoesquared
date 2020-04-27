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

async function rawQuery(query) {
  console.log("Querying: " + query)
  return (await pool.query(query))[0];
}

async function getUserByToken(token) {
  let result = await getByToken("users", token);
  if (!result) return false;
  return convertSqlToUser(result);
}

async function getUsers() {
  let results = await getAll("users");
  if (results.length == 0) return false;
  for (let i = 0; i < results.length; i++) {
    results[i] = convertSqlToUser(results[i]);
  }
  return results;
}

async function getLobbyByToken(token) {
  let result = await getByToken("lobbies", token);
  if (!result) return false;
  return convertSqlToUser(result);
}

async function getLobbies() {
  let results = await getAll("lobbies");
  if (results.length == 0) return false;
  for (let i = 0; i < results.length; i++) {
    results[i] = convertSqlToLobby(results[i]);
  }
  return results;
}

async function createUser(user) {
  if (user.constructor.name != classes.User.name) return false;
  user.creationtime = common.getTime();
  user.lastacttime = user.creationtime;
  user.timeout = user.lastacttime + usertimeout;
  user.token = common.hash(user.name + user.creationtime);
  user.lobbytokens = "";
  user.lobbyinvitetokens = "";
  console.log("Adding user " + user.name + " to database.");
  pool.query({
    sql: "INSERT INTO `users` (token, name, creationtime, lastacttime, timeout) \
     VALUES (?, ?, ?, ?, ?)",
    timeout: sqltimeout,
    values: [user.token, user.name, user.creationtime, user.lastacttime, user.timeout]
  });
  return user;
}

async function updateUserLastActivity(token) {
  return await updateUser(await getUserByToken(token));
}
async function updateUser(user) {
  if (user.constructor.name != classes.User.name) return false;
  let olduser = await getUserByToken(user.token);
  user.creationtime = olduser.creationtime;
  user.lastacttime = common.getTime();
  user.timeout = user.lastacttime + usertimeout;
  user.id = olduser.id;
  console.log("Updating user " + user.name);
  pool.query({
    sql: "UPDATE `users` \
      SET `lastacttime`=?, `lobbytokens`=?, `lobbyinvitetokens`=?, \
      `name`=?, `timeout`=? \
      WHERE `token`=?",
    timeout: sqltimeout,
    values: [user.lastacttime, user.lobbytokens, user.lobbyinvitetokens, 
      user.name, user.timeout, user.token]
  });
  return user;
}

async function createLobby(lobby) {
  if (lobby.constructor.name != classes.Lobby.name) return false;
  lobby.creationtime = common.getTime();
  lobby.lastacttime = lobby.creationtime;
  lobby.timeout = lobby.lastacttime + lobbytimeout;
  lobby.token = common.hash(lobby.name + lobby.creationtime);
  if (!checkPrivacyFlag(lobby.privacy)) return false;
  console.log("Adding lobby " + lobby.name + " to database.");
  pool.query({
    sql: "INSERT INTO `lobbies` ( \
      token, name, game, description, password, \
      privacy, creationtime, lastacttime, timeout, \
      usertokens, userinvitetokens) \
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    timeout: sqltimeout,
    values: [lobby.token, lobby.name, lobby.game, lobby.description, lobby.password,
      lobby.privacy, lobby.creationtime, lobby.lastacttime, lobby.timeout, 
      lobby.usertokens, lobby.userinvitetokens]
  });
  return lobby;
}

async function updatelobbygame(token, game) {
  let lobby = await getLobbyByToken(token);
  lobby.game = game;
  return await updatelobby(lobby);
}
async function updatelobby(lobby) {
  if (lobby.constructor.name != classes.Lobby.name) return false;
  let oldlobby = await getLobbyByToken(lobby.token);
  lobby.creationtime = oldlobby.creationtime;
  lobby.lastacttime = common.getTime();
  lobby.timeout = lobby.lastacttime + lobbytimeout;
  lobby.id = oldlobby.id;
  if (!checkPrivacyFlag(lobby.privacy)) return false;
  console.log("Updating lobby " + lobby.name);
  pool.query({
    sql: "UPDATE `lobbies` \
      SET `name`=?, `game`=?, `description`=?, `password`=?, \
      `privacy`=?, `lastacttime`=?, `timeout`=?, \
      `usertokens`=?, `userinvitetokens`=? \
      WHERE `token`=?",
    timeout: sqltimeout,
    values: [lobby.name, lobby.game, lobby.description, lobby.password, 
      lobby.privacy, lobby.lastacttime, lobby.timeout, 
      lobby.usertokens, lobby.userinvitetokens]
  });
  return lobby;
}

async function getByToken(table, token) {
  if (token == "") return false;
  console.log("Searching " + table + " with token: " + token);
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

function convertSqlToUser(row) {
  let user = new classes.User();
  user.id = row.id;
  user.token = row.token;
  user.humanid = row.humanid;
  user.name = row.name;
  user.creationtime = row.creationtime;
  user.lastacttime = row.lastacttime;
  user.lobbytokens = row.lobbytokens;
  user.lobbyinvitetokens = row.lobbyinvitetokens;
  return user;
}

function convertSqlToLobby(row) {
  let lobby = new classes.Lobby();
  lobby.id = row.id;
  lobby.token = row.token;
  lobby.humanid = row.humanid;
  lobby.game = row.game;
  lobby.name = row.name;
  lobby.description = row.description;
  lobby.password = row.password;
  lobby.privacy = row.privacy;
  lobby.creationtime = row.creationtime;
  lobby.lastacttime = row.lastacttime;
  lobby.timeout = row.timeout;
  lobby.usertokens = row.usertokens;
  lobby.userinvitetokens = row.userinvitetokens;
  return lobby;
}

module.exports = {
  init: init,
  rawQuery: rawQuery,
  getUsers: getUsers,
  getUserByToken: getUserByToken,
  getLobbies: getLobbies,
  getLobbyByToken: getLobbyByToken,
  createUser: createUser,
  updateUser: updateUser,
  updateUserLastActivity: updateUserLastActivity,
  createLobby: createLobby,
  updatelobby: updatelobby,
  updatelobbygame: updatelobbygame,
}