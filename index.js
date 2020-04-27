var express = require('express')
var app = express()
let fs = require('fs')

const sql = require("./nodejs/sql.js")
sql.init()

process()

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

async function process() {
    //console.log( await sql.rawQuery("select * from users"))
    //sql.rawQuery("insert into users (token) values ('abc')")
    //console.log( await sql.getUserByToken("abc"))
    console.log( await sql.getLobbies());
}