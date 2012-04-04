var express = require('express'),
    https = require('https');

var app = express.createServer(
  express.logger(),
  express.bodyParser()
);

app.post('/verify', function(req, res) {
  var body = JSON.stringify({
    assertion: req.body.assertion,
    audience: process.env['PUBLIC_URL']
  });

  var vreq = https.request({
    host: 'dev.diresworb.org',
    path: '/verify',
    method: 'POST',
    headers: {
      'Content-Length': body.length,
      'Content-Type': 'application/json'
    }
  }, function (vres) {
    var body = "";
    vres.on('data', function(chunk) { body += chunk; });
    vres.on('end', function() {
      res.send(body);
    });
  });
  vreq.write(body);
  vreq.end();
});

app.use(express.static(__dirname + "/static"));

app.listen(process.env['PORT'] || 8080, '0.0.0.0');
