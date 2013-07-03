var assert = require('assert');
var crypto = require('crypto');
//var config = require('../../lib/config');
var helpers = require('../helpers');
var jwcrypto = require('jwcrypto');

// algorithms
require("jwcrypto/lib/algs/rs");

var testClient = new helpers.TestClient();

var TEST_EMAIL = 'foo@example.com';
var TEST_PASSWORD = 'foo';
//var TEST_PASSWORD_NEW = 'I like pie.';
//var TEST_KB_NEW = 'super secret!';
var TEST_WRAPKB = crypto.randomBytes(32).toString('base64');

describe('user', function() {
  var session, pubkey, signToken;

  it('should create an account with SPR verifier', function (done) {
    testClient.createSRP(TEST_EMAIL, TEST_PASSWORD, TEST_WRAPKB, done);
  });

  it('should login with SRP', function (done) {
    testClient.loginSRP(TEST_EMAIL, TEST_PASSWORD, function (err, keys) {
      try {
        assert(!err);
        assert.equal(TEST_WRAPKB, keys.wrapKb);
        signToken = keys.signToken;
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should fail to create a new account for an existing email', function(done) {
    testClient.createSRP(TEST_EMAIL, TEST_PASSWORD, TEST_WRAPKB, function (err, res) {
      try {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'AccountExistsForEmail');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });


  it('should fail to login with an unknown email', function(done) {
    testClient.makeRequest('POST', '/startLogin', {
      payload: { email: 'bad@emai.l' }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 404);
        assert.equal(res.result.message, 'UnknownUser');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should return SRP parameters on startlogin', function(done) {
    testClient.makeRequest('POST', '/startLogin', {
      payload: { email: TEST_EMAIL }
    }, function(res) {
      session = res.result;

      try {
        assert.ok(res.result.sessionId);
        assert.ok(res.result.srp);
        assert.ok(res.result.srp.B);
        assert.ok(res.result.srp.s);
        assert.ok(res.result.srp.N_bits);
        assert.ok(res.result.srp.alg);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should fail to login with a bad SRP', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: session.sessionId,
        A: 'bad',
        M: 'bad'
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'IncorrectPassword');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should finish login', function (done) {
    testClient.finishLogin(session, TEST_EMAIL, TEST_PASSWORD, function (err, b) {
      try {
        assert.ok(b.kA);
      } catch (e) {
        return done(e);
      }
      done();

    });
  });

  it('should fail to login with an old sessionId', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: session.sessionId,
        A: 'bad',
        M: 'bad'
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'UnknownSession');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should fail to login with an unknown sessionId', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: 'bad sessionid',
        A: 'bad',
        M: 'bad'
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'UnknownSession');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should generate a pubkey', function(done) {
    jwcrypto.generateKeypair({ algorithm: "RS", keysize: 64 }, function(err, keypair) {
      pubkey = keypair.publicKey;
      done(err);
    });
  });

  it('should sign a pubkey', function(done) {
    testClient.sign(pubkey.serialize(), 50000, signToken, true, function (err, result) {
      try {
        assert.ok(result);
        // check for rough format of a cert
        assert.equal(result.cert.split(".").length, 3);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should not sign with an invalid signToken', function(done) {
    testClient.sign(pubkey.serialize(), 50000, Buffer(32), true, function (err, result) {
      try {
        assert.equal(result.code, 401);
        assert.equal(result.message, 'Unknown credentials');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  // it('should not sign without a hawk verified payload', function(done) {
  //   testClient.sign(pubkey.serialize(), 50000, signToken, false, function (err, result) {
  //     try {
  //       assert.equal(result.code, 401);
  //       assert.equal(result.message, 'Payload is invalid');
  //     } catch (e) {
  //       return done(e);
  //     }
  //     done();
  //   });
  // });

/*
  it('should begin a new login', function(done) {
    testClient.makeRequest('POST', '/startLogin', {
      payload: { email: TEST_EMAIL }
    }, function(res) {
      sessionId = res.result.sessionId;

      try {
        assert.ok(res.result.sessionId);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should get resetToken', function(done) {
    testClient.makeRequest('POST', '/resetToken', {
      payload: {
        accountToken: accountToken
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 200);
        resetToken = res.result.resetToken;
        assert.ok(res.result.resetToken);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should reset the account', function(done) {
    testClient.makeRequest('POST', '/resetPassword', {
      payload: {
        resetToken: resetToken,
        verifier: TEST_PASSWORD_NEW,
        params: { foo: 'bar2' },
        wrapKb: TEST_KB_NEW
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result, 'ok');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should begin a login with resetted account', function(done) {
    testClient.makeRequest('POST', '/startLogin', {
      payload: { email: TEST_EMAIL }
    }, function(res) {
      sessionId = res.result.sessionId;

      try {
        assert.ok(res.result.sessionId);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should fail to login with old password', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: TEST_PASSWORD
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'IncorrectPassword');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should finish login with new password', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: TEST_PASSWORD_NEW
      }
    }, function(res) {
      try {
        accountToken = res.result.accountToken;

        assert.ok(res.result.accountToken);
        assert.ok(res.result.kA);
        assert.equal(res.result.wrapKb, TEST_KB_NEW);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });
*/

  it('should generate 32 bytes of random crypto entropy', function(done) {
    testClient.makeRequest('GET', '/entropy', function(res) {
      var entropy;
      try {
        entropy = res.result;
        assert.equal(res.statusCode, 200);
        assert.equal(entropy.length, 44);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

});

