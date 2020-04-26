var express = require('express')
var app = express()
let fs = require('fs')

const DIR = "./docs/"

app.get('/index.html', function(req, res) {
    res.redirect('/')
})

app.use(express.static(DIR))

app.get('/', function(req, res) {
    res.render(DIR + 'index.html')
})

app.listen(5500, '127.0.0.1')