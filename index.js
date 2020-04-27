var express = require('express')
var app = express()
let fs = require('fs')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// const sql = require("./nodejs/sql.js")
// sql.init()

// to import another router
// app.use(require("./nodejs/test.js"))
app.use(require("./nodejs/requestPlayerToken.js"))
app.use(require("./nodejs/doesPlayerTokenExist.js"))

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