var express = require('express'),
      https = require('https'),
   sessions = require('client-sessions');

var app = express.createServer(
  express.logger(),
  express.bodyParser(),
  sessions({
    cookieName: '123done',
    secret: process.env['COOKIE_SECRET'] || 'define a real secret, please',
    cookie: {
      path: '/api',
      httpOnly: true
    }
  })
);

app.post('/api/verify', function(req, res) {
  var body = JSON.stringify({
    assertion: req.body.assertion,
    audience: process.env['PUBLIC_URL'] || 'http://127.0.0.1:8080'
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
      try {
        // if response is successful, indicate the user is logged in
        req.session.user = JSON.parse(body).email;
      } catch(e) {
      }
      res.send(body);
    });
  });
  vreq.write(body);
  vreq.end();
});

app.get('/api/auth_status', function(req, res) {
  res.send(JSON.stringify({
    logged_in_email: req.session.user || null,
  }));
});

app.post('/api/logout', function(req, res) {
  req.session.user = null;
  res.send(200);
});

app.use(express.static(__dirname + "/static"));

app.listen(process.env['PORT'] || 8080, '0.0.0.0');
