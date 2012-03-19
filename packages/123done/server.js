var express = require('express');

var app = express.createServer();

app.use(express.bodyParser());

app.use(express.static(__dirname + "/static"));

app.listen(process.env['PORT'] || 8080, '127.0.0.1');
