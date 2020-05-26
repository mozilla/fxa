/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

const CLIENT_ID = 'dcdb5ae7add825d2';
const ID_TOKEN =
  '001122334455.66778899aabbccddeeff00112233445566778899.aabbccddeeff';
const PUBLIC_CLIENT_ID = 'a2270f727f45f648';

describe('oauth', function () {
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  let env;

  beforeEach(function () {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
  });

  it('#createOAuthCode - missing sessionToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthCode(null, CLIENT_ID, 'state'),
          RequestMocks.createOAuthCode
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing sessionToken');
      });
  });

  it('#createOAuthCode - missing clientId', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthCode(account.signIn.sessionToken, null, 'state'),
          RequestMocks.createOAuthCode
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing clientId');
      });
  });

  it('#createOAuthCode - missing state', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthCode(account.signIn.sessionToken, CLIENT_ID, null),
          RequestMocks.createOAuthCode
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing state');
      });
  });

  it('#createOAuthCode', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthCode(
            account.signIn.sessionToken,
            CLIENT_ID,
            'state'
          ),
          RequestMocks.createOAuthCode
        );
      })
      .then(function (resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('#createOAuthToken - missing sessionToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthToken(null, CLIENT_ID),
          RequestMocks.createOAuthToken
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing sessionToken');
      });
  });

  it('#createOAuthToken - missing clientId', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthToken(account.signIn.sessionToken, null),
          RequestMocks.createOAuthToken
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing clientId');
      });
  });

  it('#createOAuthToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.createOAuthToken(
            account.signIn.sessionToken,
            PUBLIC_CLIENT_ID
          ),
          RequestMocks.createOAuthToken
        );
      })
      .then(function (resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('#getOAuthScopedKeyData - missing sessionToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.getOAuthScopedKeyData(null, CLIENT_ID, 'profile'),
          RequestMocks.getOAuthScopedKeyData
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing sessionToken');
      });
  });

  it('#getOAuthScopedKeyData - missing clientId', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.getOAuthScopedKeyData(
            account.signIn.sessionToken,
            null,
            'profile'
          ),
          RequestMocks.getOAuthScopedKeyData
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing clientId');
      });
  });

  it('#getOAuthScopedKeyData - missing scope', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.getOAuthScopedKeyData(
            account.signIn.sessionToken,
            CLIENT_ID,
            null
          ),
          RequestMocks.getOAuthScopedKeyData
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing scope');
      });
  });

  it('#getOAuthScopedKeyData', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.getOAuthScopedKeyData(
            account.signIn.sessionToken,
            CLIENT_ID,
            'profile'
          ),
          RequestMocks.getOAuthScopedKeyData
        );
      })
      .then(function (resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('#verifyIdToken - missing idToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.verifyIdToken(null, CLIENT_ID),
          RequestMocks.verifyIdToken
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing idToken');
      });
  });

  it('#verifyIdToken - missing clientId', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.verifyIdToken(ID_TOKEN, null),
          RequestMocks.verifyIdToken
        );
      })
      .then(assert.fail, function (error) {
        assert.include(error.message, 'Missing clientId');
      });
  });

  it('#verifyIdToken', function () {
    return accountHelper
      .newVerifiedAccount()
      .then(function (account) {
        return respond(
          client.verifyIdToken(ID_TOKEN, CLIENT_ID),
          RequestMocks.verifyIdToken
        );
      })
      .then(function (resp) {
        assert.ok(resp);
      }, assert.fail);
  });
});
