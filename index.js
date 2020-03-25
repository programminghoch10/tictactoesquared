var express = require('express');
var app = express();

const hostname = "127.0.0.1"
const port = "5500"

app.get('/test', (req, res) => {
    res.send('Hello, world');
});

app.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}/`)
})