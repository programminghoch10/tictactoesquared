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
  let result = await getByToken("l", token);
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
  user.token = common.hash(user.name + user.creationtime);
  user.lobbytokens = "";
  user.lobbyinvitetokens = "";
  console.log("Adding user " + user.name + " to database.");
  pool.query({
    sql: "INSERT INTO `users` (token, name, creationtime, lastacttime) \
     VALUES (?, ?, ?, ?)",
    timeout: sqltimeout,
    values: [user.token, user.name, user.creationtime, user.lastacttime]
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
  user.id = olduser.id;
  pool.query({
    sql: "UPDATE `users` \
      SET `lastacttime`=?, `lobbytokens`=?, `lobbyinvitetokens`=?, `name`=? \
      WHERE `token`=?",
    timeout: sqltimeout,
    values: [user.lastacttime, user.lobbytokens, user.lobbyinvitetokens, 
      user.name, user.token]
  });
  return user;
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
}