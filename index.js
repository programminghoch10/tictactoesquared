var express = require('express')
var app = express()
let fs = require('fs')

const sql = require("./nodejs/sql.js")
sql.init()
console.log(sql.i)

// to import another router
// app.use(require("./nodejs/test.js"))

const DIR = "./docs/"

app.get('/index.html', function(req, res) {
    res.redirect('/')
})

app.use(express.static(DIR))

app.get('/', function(req, res) {
    res.render(DIR + 'index.html')
})

// sql.dropAllTables()

app.listen(5500, '127.0.0.1')