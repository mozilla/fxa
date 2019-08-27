const express = require('express');
const morgan = require('morgan');
const path = require('path');
const sessions = require('client-sessions');

const config = require('./config');

const logger = morgan('short');

const app = express();

app.use(logger, express.json());

app.use(function(req, res, next) {
  if (/^\/api/.test(req.url)) {
    res.setHeader('Cache-Control', 'no-cache, max-age=0');

    return sessions({
      cookieName: config.cookieName || 'fortress',
      secret: process.env['COOKIE_SECRET'] || 'define a real secret, please',
      requestKey: 'session',
      cookie: {
        path: '/api',
        httpOnly: true,
      },
    })(req, res, next);
  } else {
    return next();
  }
});

app.get('/download', function(req, res, next) {
  req.url = '/download.html';
  next();
});

app.get(/^\/iframe(:?\/(?:index.html)?)?$/, function(req, res, next) {
  req.url = '/index.html';
  next();
});

app.use(express.static(path.join(__dirname, 'static')));

const port = process.env['PORT'] || config.port || 9292;
app.listen(port, '0.0.0.0');
console.log('Firefox Fortress started on port', port); //eslint-disable-line no-console
