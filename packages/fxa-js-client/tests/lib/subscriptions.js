/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

describe('subscriptions', function() {
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  let env;
  let remoteServer;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
    remoteServer = env.useRemoteServer;
  });

  it('#getSubscriptionPlans - missing token', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.getSubscriptionPlans(),
          RequestMocks.getSubscriptionPlans
        );
      })
      .then(assert.fail, function(error) {
        assert.include(error.message, 'Missing token');
      });
  });

  it('#getSubscriptionPlans', function() {
    if (remoteServer) {
      return this.skip();
    }

    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.getSubscriptionPlans('saynomore'),
          RequestMocks.getSubscriptionPlans
        );
      })
      .then(function(resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('#getActiveSubscriptions - missing token', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.getActiveSubscriptions(),
          RequestMocks.getActiveSubscriptions
        );
      })
      .then(assert.fail, function(error) {
        assert.include(error.message, 'Missing token');
      });
  });

  // This test is intended to run against a mock auth-server. To test
  // against a local auth-server, we'd need to know a valid subscription.
  it('#getActiveSubscriptions', function() {
    if (remoteServer) {
      return this.skip();
    }

    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.getActiveSubscriptions('saynomore'),
          RequestMocks.getActiveSubscriptions
        );
      })
      .then(function(resp) {
        assert.ok(resp);
      }, assert.fail);
  });

  it('#createSupportTicket - missing token', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.createSupportTicket(),
          RequestMocks.createSupportTicket
        );
      })
      .then(assert.fail, function(error) {
        assert.include(error.message, 'Missing token');
      });
  });
  it('#createSupportTicket - missing supportTicket', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.createSupportTicket('redpandas'),
          RequestMocks.createSupportTicket
        );
      })
      .then(assert.fail, function(error) {
        assert.include(error.message, 'Missing supportTicket');
      });
  });

  // This test is intended to run against a mock auth-server. To test
  // against a local auth-server, we'd need to know a valid subscription.
  it('#createSupportTicket', function() {
    if (remoteServer) {
      return this.skip();
    }

    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        return respond(
          client.createSupportTicket('redpandas', {
            topic: 'Species',
            issue: 'Other',
            subject: 'Cute & Rare',
            message: 'Need moar',
          }),
          RequestMocks.createSupportTicket
        );
      })
      .then(function(resp) {
        assert.ok(resp);
      });
  });
});
