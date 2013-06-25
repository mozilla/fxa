var assert = require('assert');
//var config = require('../../lib/config');
var helpers = require('../helpers');
var jwcrypto = require('jwcrypto');

// algorithms
require("jwcrypto/lib/algs/rs");

var testClient = new helpers.TestClient();

var TEST_EMAIL = 'foo@example.com';
var TEST_PASSWORD = 'foo';
var TEST_SALT = 'kosher';
var TEST_PASSWORD_NEW = 'I like pie.';
var TEST_KB = 'secret!';
var TEST_KB_NEW = 'super secret!';

describe('user', function() {
  var sessionId, accountToken, pubkey, signToken, resetToken;

  it('should create a new account', function(done) {
    testClient.makeRequest('POST', '/create', {
      payload: {
        email: TEST_EMAIL,
        verifier: TEST_PASSWORD,
        salt: TEST_SALT,
        params: { foo: 'bar' },
        wrapKb: TEST_KB
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

  it('should fail to create a new account for an existing email', function(done) {
    testClient.makeRequest('POST', '/create', {
      payload: {
        email: TEST_EMAIL,
        verifier: TEST_PASSWORD,
        salt: TEST_SALT,
        params: { foo: 'bar' },
        wrapKb: TEST_KB
      }
    }, function(res) {
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

  it('should begin login', function(done) {
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

  it('should fail to login with a bad password', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: 'bad pass'
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

  it('should fail to login with an unknown sessionId', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: 'bad sessionid',
        password: TEST_PASSWORD
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 404);
        assert.equal(res.result.message, 'UnknownSession');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should finish login', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: TEST_PASSWORD
      }
    }, function(res) {
      try {
        accountToken = res.result.accountToken;

        assert.ok(res.result.accountToken);
        assert.ok(res.result.kA);
        assert.equal(res.result.wrapKb, TEST_KB);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should fail to login with an old sessionId', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: TEST_PASSWORD
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 404);
        assert.equal(res.result.message, 'UnknownSession');
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should get signToken', function(done) {
    testClient.makeRequest('POST', '/signToken', {
      payload: {
        accountToken: accountToken
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 200);
        signToken = res.result.signToken;
        assert.ok(res.result.signToken);
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
    testClient.makeRequest('POST', '/sign', {
      payload: {
        token: signToken,
        publicKey: pubkey.serialize(),
        duration: 50000
      }
    }, function(res) {
      try {
        assert.equal(res.statusCode, 200);
        // check for rough format of a cert
        assert.equal(res.result.split(".").length, 3);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

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

  it('should finish login and get a new accountToken', function(done) {
    testClient.makeRequest('POST', '/finishLogin', {
      payload: {
        sessionId: sessionId,
        password: TEST_PASSWORD
      }
    }, function(res) {
      try {
        accountToken = res.result.accountToken;

        assert.ok(res.result.accountToken);
        assert.ok(res.result.kA);
        assert.equal(res.result.wrapKb, TEST_KB);
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

});

