/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const crypto = require('crypto');
const Client = require('../client/');
const srp = require('srp');
const P = require('p-promise')


const SERVER_URL = "http://idp.loadtest.lcip.org";


// Error constants used by the picl-idp API.
//
ERROR_ACCOUNT_EXISTS = 101;
ERROR_UNKNOWN_ACCOUNT = 102;


// The tests need a public key for the server to sign, but we don't actually
// do anything with it.  It suffices to use a fixed dummy key throughout.
//
var DUMMY_PUBLIC_KEY = {
  "algorithm": "RS",
  "n": "4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
  "e": "65537"
};


// We don't want to do any key-stretching during the loadtest, because it
// takes a long time.  Instead we start from a fixed set of SRP credentials
// and mix in just enough user-account-specific information to make the
// authentication work properly.
//
var DUMMY_CLIENT_CREDENTIALS = {
  email: null,
  srpPw: "f6c1cc977d2811c55f0260f0318c8cbe13d215120f5d4f1113b33f32db670e81",
  unwrapBKey: "c8bdcea80dd5ebc94b870f57b840a5f9ea1d82d5eae72a5081831c7f3667be74",
  passwordSalt: "AAAAAA",
  srp: {
    type: "SRP-6a/SHA256/2048/v1",
    salt: "f4f435710b693852e6602a58c902a37539e4ce8351c6495f0b28b4c5cbad0cd4",
    algorithm: "sha256",
    verifier: null,
  }
}


// Build an SRP verifier to go with the dummy credentials defined above.
//
function getDummySRPVerifier(email) {
  var res = srp.getv(
    Buffer(DUMMY_CLIENT_CREDENTIALS.srp.salt, 'hex'),
    Buffer(email),
    Buffer(DUMMY_CLIENT_CREDENTIALS.srpPw),
    srp.params['2048'].N,
    srp.params['2048'].g,
    DUMMY_CLIENT_CREDENTIALS.srp.algorithm
 );
 if (res.length < 256) {
   var tmp = res;
   var padding = res.length - 256;
   var res = new Buffer(256);
   res.full(0, 0, padding);
   tmp.copy(res, padding);
 }
 return res.toString('hex');
}


//  Construct and return a new API Client object.
//  This produces a new Client object with credentials in place, ready
//  to perform API requests and send the resulting performance data back
//  to the loads test runner.  It uses the dummy credentials defined above.
//
//  You must provide the email address to use, and the loads communication
//  socket.
//
function getClient(email, loadsSocket) {

  var client = new Client(SERVER_URL);

  // Set up dummy credentials.
  // We have to mix the email address into the SRP verifier, but
  // everything else can be pre-calculated.
  for (var k in DUMMY_CLIENT_CREDENTIALS) {
    client[k] = DUMMY_CLIENT_CREDENTIALS[k];
  }
  client.email = Buffer(email).toString('hex');
  client.srp.verifier = getDummySRPVerifier(client.email);

  // Instrument the API to send request back back to loads test runner.
  client.api.on('startRequest', function(options) {
    options._loadsStartTime = +new Date();
  });
  client.api.on('endRequest', function(options, err, res) {
    if (!err) {
      var loadsEndTime = +new Date();
      loadsSocket.send('add_hit', {
        url: options.url,
        method: options.method,
        status: res.statusCode,
        started: options._loadsStartTime / 1000,
        elapsed: (loadsEndTime - options._loadsStartTime) / 1000
      });
    }
  });

  return client
}


//  Generate a short random hex string.
//  Useful where you need something unique.
//
function uniqueID(size) {
  if (!size) {
    size = 10;
  }
  return crypto.randomBytes(size/2 + 1).toString('hex').substring(0, size);
}


//  Generate a random integer in the range [min, max]
//
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}



//  And finally, here is the actual loadtest!
//
function runLoadTest(loadsSocket) {

  // Target ratio is 2 new-account signups per 10 old-account signups.
  // We use a restricted pool of old-account email addresses to simulate
  // existing users; they will be populated quickly during the loadtest
  // run.  We use randomly-generated email addresses to simulate new accounts
  // and will forcibly delete any that are found to exist.

  var email;
  var client;
  var ready;

  if (getRandomInt(1, 12) <= 2) {
    //  New user.
    //  Assume it doesnt exist and try to create; delete and retry if it does.
    email = "loady" + uniqueID() + " @restmail.lcip.org";
    client = getClient(email, loadsSocket);
    ready = client.create().fail(function(err) {
      if (err.code != 400 || err.errno != ERROR_ACCOUNT_EXISTS) {
        throw err;
      }
      return client.destroyAccount().then(function() {
        return client.create();
      });
    }).then(function() {
      return client.login();
    });
  } else {
    //  Existing user.
    //  Assume it exists and try to authentiate; create only if not exists.
    email = "loady" + getRandomInt(1, 100) + " @restmail.lcip.org";
    client = getClient(email, loadsSocket);
    ready = client.login().fail(function(err) {
      if (err.code != 400 || err.errno != ERROR_UNKNOWN_ACCOUNT) {
        throw err;
      }
      return client.create().then(function() {
        return client.login();
      });
    });
  }


  // We fetch the cryptographic key material, then make a bunch of cert
  // signing requests.  The cert-signing request is expected to be by
  // *far* the most frequent operation, so we do a lot of them.

  var done = ready.then(function() {
    // Fetch the key material.
    return client.keys();
  }).then(function(keys) {
    // Check that we actually got some key material.
    assert.equal(typeof keys.kA, 'string', 'kA exists');
    assert.equal(typeof keys.wrapKb, 'string', 'wrapKb exists');
  }).then(function() {
    // Make a bunch of certificate-signing requests.
    // Varying the number of iterations of this loop is a simple way
    // to de-synchronize concurrent runs of this test, spreading out the
    // other operations more evenly throughout the run.
    var p = P();
    for (var i=0; i < getRandomInt(10, 100); i++) {
      p = p.then(function() {
        return client.sign(DUMMY_PUBLIC_KEY, 1000 * 60 * 60);
      }).then(function(cert) {
        assert.equal(typeof cert, 'string', 'cert exists');
      });
    }
    return p;
  });

  return done
}


//  The current loads.js test runner spawns a new process for every run
//  of the test, which can severely hamper throughput.  To work around this
//  for now, we do several iterations of the test before reporting success
//  back to the loads runner.
//
//  XXX TODO: fix this issue upstream in the loads.js runner
//
module.exports.picl_idp_loadtest = function picl_idp_loadtest(cb) {
  var p = P();
  // Try to detect whether we're in a "big" bench suite by looking at
  // the LOADS_STATUS environment variable.  We don't want to loop
  // forever if we're in a quick `make test` run.
  var numLoadRuns = 1;
  if (process.env.LOADS_STATUS && process.env.LOADS_STATUS !== "1,1,1,1") {
    numLoadRuns = 100;
  }
  for (var i=0; i < numLoadRuns; i++) {
    p = p.then(function() {
      return runLoadTest(cb.socket);
    });
  }
  p.done(
    function() { return cb(null); },
    function(err) { return cb(err); }
  );
}
