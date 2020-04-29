var express = require('express')
var app = express()
let fs = require('fs')

const sql = require("./nodejs/sql.js")
sql.init()

process()

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
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

const DIR = "./docs/"

app.get('/index.html', function(req, res) {
    res.redirect('/')
})

app.use(express.static(DIR))

app.get('/', function(req, res) {
    res.render(DIR + 'index.html')
})

app.post('/test', function(req, res) {
    console.log(req.body)
    res.sendStatus(200)
})

app.listen(5500, '127.0.0.1')

async function process() {
    //console.log( await sql.getUserByToken("abc"))
    //console.log( await sql.getLobbies());
    //console.log(await sql.getUsers())
    // console.log(await sql.getLobbies())
}