/*
 * Needs to be declared in sqllogin.js:
 * module.exports = {
 *  hostname: "***",
 *  username: "***",
 *  password: "***"
 * }
 */

function init() {
  let logindata = require('./sqllogin.js')

  this.mysql = require('mysql');

  this.connection = this.mysql.createConnection({
    host: logindata.hostname,
    user: logindata.username,
    password: logindata.password
  });

  this.connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to sql!");
  });
}

module.exports = {
  init: init
}