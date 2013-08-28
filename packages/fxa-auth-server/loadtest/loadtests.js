const assert = require('assert');
const crypto = require('crypto');
const Client = require('../client/');

SERVER_URL = "http://idp.loadtest.lcip.org/";

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

module.exports.picl_idp_loadtest = function picl_idp_loadtest(cb) {

  var socket = cb.socket;

  var client = new Client(SERVER_URL);

  // Listen for request events, so we can send timing information.
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

  // Do some simple account operations to test things out.

  var userid = uniqueID() + "@restmail.lcip.org";
  var password = uniqueID();
  var publicKey = {
    "algorithm":"RS",
    "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
    "e":"65537"
  };

  client.setupCredentials(userid, password).then(
    // Create the new account.
    function () {
      return client.create();
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
