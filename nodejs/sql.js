/*
 * Needs to be declared in sqllogin.js:
 * module.exports = {
 *  hostname: "***",
 *  username: "***",
 *  password: "***"
 * }
 */

var mysql;
var con; //mysql connection

function init() {
  let logindata = require('./sqllogin.js')

  mysql = require('mysql');

  con = mysql.createConnection({
    host: logindata.hostname,
    user: logindata.username,
    password: logindata.password,
    database: logindata.database,
  });

  /*con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to sql!");
  });*/
  //no inital connect needed, because a query automatically starts the connection
  con.on('error', function(err) {
    //console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      //init(); 
      //no automatic reconnect, because a query automatically starts a connection
    } else {
      throw err;
    }
  });
}

module.exports = {
  init: init
}