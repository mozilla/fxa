var crypto = require('crypto');

var async = require('async');
var Client = require('./index');

var email = 'me@example.com';
var password = 'verySecurePassword';
var kB = crypto.randomBytes(32).toString('hex');
var publicKey = {
  "algorithm":"RS",
  "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e":"65537"
};
var duration = 1000 * 60 * 60 * 24;

var c = new Client('http://localhost:9000');

async.waterfall([
  function (next) {
    c.create(email, password, kB, next);
  },
  function (res, next) {
    console.log('created account');
    c.startLogin(email, next);
  },
  function (res, next) {
    console.log('started session');
    c.finishLogin(res, email, password, next);
  },
  function (res, next) {
    console.log('got sign token');
    c.sign(publicKey, duration, res.token, next);
  }
  ],
  function (err, result) {
    if (err) {
      return console.error(err);
    }
    console.log('signed key');
    console.log('cert', result.cert);
  }
);