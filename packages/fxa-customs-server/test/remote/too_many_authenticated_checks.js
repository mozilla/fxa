/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Override limit values for testing
process.env.UID_RATE_LIMIT = 3;
process.env.UID_RATE_LIMIT_INTERVAL_SECONDS = 2;
process.env.UID_RATE_LIMIT_BAN_DURATION_SECONDS = 2;

var test = require('tap').test;
var TestServer = require('../test_server');
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));
var mcHelper = require('../memcache-helper');

var TEST_IP = '192.0.2.1';
var TEST_UID = 'abc123';
var ACTION_ONE = 'action1';
var ACTION_A = 'actionA';
var ACTION_B = 'actionB';

var config = {
  listen: {
    port: 7000,
  },
};

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', function(t) {
  testServer.start(function(err) {
    t.type(testServer.server, 'object', 'test server was started');
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('clear everything', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('/checkAuthenticated requires action', function(t) {
  return client
    .postAsync('/checkAuthenticated', { ip: TEST_IP, uid: TEST_UID })
    .spread(function(req, res, obj) {
      t.fail('Success response from request missing param.');
      t.end();
    })
    .catch(function(err) {
      t.equal(err.statusCode, 400, 'returns a 400');
      t.equal(err.body.code, 'MissingParameters');
      t.end();
    });
});

test('/checkAuthenticated requires ip', function(t) {
  return client
    .postAsync('/checkAuthenticated', { action: ACTION_ONE, uid: TEST_UID })
    .spread(function(req, res, obj) {
      t.fail('Success response from request missing param.');
      t.end();
    })
    .catch(function(err) {
      t.equal(err.statusCode, 400, 'returns a 400');
      t.equal(err.body.code, 'MissingParameters');
      t.end();
    });
});

test('/checkAuthenticated requires uid', function(t) {
  return client
    .postAsync('/checkAuthenticated', { action: ACTION_ONE, ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.fail('Success response from request missing param.');
      t.end();
    })
    .catch(function(err) {
      t.equal(err.statusCode, 400, 'returns a 400');
      t.equal(err.body.code, 'MissingParameters');
      t.end();
    });
});

test('/checkAuthenticated with same action', function(t) {
  // Send requests until it blocks
  return (
    client
      .postAsync('/checkAuthenticated', {
        action: ACTION_ONE,
        ip: TEST_IP,
        uid: TEST_UID,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200 check1');
        t.equal(obj.block, false, 'not rate limited');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_ONE,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200 check2');
        t.equal(obj.block, false, 'not rate limited');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_ONE,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      // uid should be now blocked
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200 check3');
        t.equal(obj.block, true, 'uid is rate limited');

        // Delay ~2s for rate limit to go away
        return Promise.delay(2010);
      })
      // uid should be now unblocked
      .then(function() {
        return client.postAsync('/checkAuthenticated', {
          action: ACTION_ONE,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(
          obj.block,
          false,
          'is not rate limited after UID_RATE_LIMIT_BAN_DURATION_SECONDS'
        );
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
});

test('/checkAuthenticated with different actions', function(t) {
  // Send requests until one gets rate limited
  return (
    client
      .postAsync('/checkAuthenticated', {
        action: ACTION_A,
        ip: TEST_IP,
        uid: TEST_UID,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited on check1, actionA');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_B,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited on check1, actionB');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_A,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited on check2, actionA');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_A,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      // uid should be now blocked to action1
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'uid is actionA rate limited after check3');

        return client.postAsync('/checkAuthenticated', {
          action: ACTION_B,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited for actionB after check2');

        // Delay ~2s for rate limit to go away
        return Promise.delay(2010);
      })
      // uid should be now unblocked
      .then(function() {
        return client.postAsync('/checkAuthenticated', {
          action: ACTION_A,
          ip: TEST_IP,
          uid: TEST_UID,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(
          obj.block,
          false,
          'is not rate limited after UID_RATE_LIMIT_BAN_DURATION_SECONDS'
        );
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
});

test('teardown', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
