var express = require('express')
var app = express()
let fs = require('fs')

const sql = require("./nodejs/sql.js")
sql.init()

const CLEANUP_INTERVAL = 10; //in minutes
const cleanup = require("./nodejs/cleanup.js")
var cleanuphandler = setInterval(cleanup, CLEANUP_INTERVAL * 60 * 1000)

process()

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// to import another router
// app.use(require("./nodejs/test.js"))
app.use(require("./nodejs/api/createUser.js"))
app.use(require("./nodejs/api/doesUserTokenExist.js"))
app.use(require("./nodejs/api/createLobby.js"))
app.use(require("./nodejs/api/changeName.js"))
app.use(require("./nodejs/api/getUser.js"))
app.use(require("./nodejs/api/getLobby.js"))
app.use(require("./nodejs/api/getLobbies.js"))
app.use(require("./nodejs/api/leaveLobby.js"))
app.use(require("./nodejs/api/joinLobby.js"))
app.use(require("./nodejs/api/play.js"))
app.use(require("./nodejs/api/spectate.js"))

const DIR = "./docs/"

app.get('/index.html', function (req, res) {
  res.redirect('/')
})

app.use(express.static(DIR))

app.get('/', function (req, res) {
  res.render(DIR + 'index.html')
})

app.listen(5500, '0.0.0.0')

async function process() {
  //console.log( await sql.getUserByToken("abc"))
  //console.log( await sql.getLobbies());
  //console.log(await sql.getUsers())
  // console.log(await sql.getLobbies())
}
