var assert = require('assert');
//var config = require('../../lib/config');
var helpers = require('../helpers');
var jwcrypto = require('jwcrypto');

// algorithms
require("jwcrypto/lib/algs/rs");

var testClient = new helpers.TestClient();

var TEST_EMAIL = 'foo@example.com';
var TEST_PASSWORD = 'foo';
var TEST_KB = 'secret!';

describe('user', function() {
  var sessionId, accountToken, pubkey, signToken;

  it('should create a new account', function(done) {
    testClient.makeRequest('POST', '/create', {
      payload: {
        email: TEST_EMAIL,
        verifier: TEST_PASSWORD,
        params: { foo: 'bar' },
        kB: TEST_KB
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
        params: { foo: 'bar' },
        kB: TEST_KB
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
        assert.equal(res.result.kB, TEST_KB);
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

});

