const assert = require('assert');
const crypto = require('crypto');
const Client = require('../client/');
const P = require('p-promise')


const precomputed_credentials = require("./precomputed_credentials.js")

SERVER_URL = "http://idp.loadtest.lcip.org";


function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


module.exports.picl_idp_loadtest = function picl_idp_loadtest(cb) {

  var socket = cb.socket;

  var client = new Client(SERVER_URL);

  // Monitor the requests performed by the Client api,
  // and send performance information back to loads.

  client.api.on('startRequest', function(options) {
    options._loadsStartTime = +new Date();
  });

  client.api.on('endRequest', function(options, err, res) {
    if (!err) {
      var loadsEndTime = +new Date();
      socket.send('add_hit', {
        url: options.url,
        method: options.method,
        status: res.statusCode,
        started: options._loadsStartTime / 1000,
        elapsed: (loadsEndTime - options._loadsStartTime) / 1000
      });
    }
  });


  // Target ratio is 2 new-account signups per 10 old-account signups.
  // use a restricted pool of old-account email addresses to simulate
  // existing usings; they will be populated quickly during the loadtest.

  var userid;
  if (getRandomInt(1, 12) <= 2) {
    userid = uniqueID();
  } else {
    userid = getRandomInt(1, 100);
  }
  userid = "loady" + userid + "@restmail.lcip.org"

  // Use pre-computed SRP credentials where possible; doing keystretching for
  // every single run of these tests makes a mockery of loadtest throughput.

  var ready;
  var creds = precomputed_credentials[userid];
  if (!creds) {
    ready = client.setupCredentials(userid, "loadtestpassword", "AAAAAA");
  } else {
    for (var k in creds) {
      if (creds.hasOwnProperty(k)) {
        client[k] = creds[k];
      }
    }
    ready = P();
  }

  // Use a constant public-key to pass to cert-signing requests.
  // We don't need it for anything else in the tests

  var publicKey = {
    "algorithm":"RS",
    "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
    "e":"65537"
  };

  ready.then(
    // Try to create the new account.
    function () {
      return client.create();
    }
  ).fail(
    // Likely it already exists, but that's ok.
    // XXX TODO: better to pre-populate the database?
    // XXX TODO: error codes as defined constants?
    function (err) {
      if (err.code != 400 || err.errno != 101) {
          throw err;
      }
    }
  ).then(
    // Fetch the key material.
    function () {
      return client.keys();
    }
  ).then(
    // Check that we actually got some key material.
    function (keys) {
      assert.equal(typeof keys.kA, 'string', 'kA exists');
      assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
    }
  ).then(
    // Check that we can sign a public key.
    function () {
        return client.sign(publicKey, 1000 * 60 * 60);
    }
  ).then(
    // And that it comes back correctly.
    function (cert) {
      assert.equal(typeof cert, 'string', 'cert exists');
    }
  ).done(
    function() { return cb(null); },
    function(err) { return cb(err); }
  );

}
