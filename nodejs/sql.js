/*
 * Needs to be declared in sqllogin.js:
 * module.exports = {
 *  hostname: "***",
 *  username: "***",
 *  password: "***"
 * }
 */

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

async function rawquery(query) {
  console.log("Querying: " + query)
  return (await pool.query(query))[0];
}

module.exports = {
  init: init,
  rawquery: rawquery,
}