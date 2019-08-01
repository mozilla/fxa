/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const Environment = require('../addons/environment');

describe('certificateSign', function() {
  var accountHelper;
  var respond;
  var client;
  var RequestMocks;
  let env;

  beforeEach(function() {
    env = new Environment();
    accountHelper = env.accountHelper;
    respond = env.respond;
    client = env.client;
    RequestMocks = env.RequestMocks;
  });

  it('#basic', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        var publicKey = {
          algorithm: 'RS',
          n:
            '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
          e: '65537',
        };
        var duration = 86400000;

        return respond(
          client.certificateSign(
            account.signIn.sessionToken,
            publicKey,
            duration
          ),
          RequestMocks.certificateSign
        );
      })
      .then(function(res) {
        assert.property(res, 'cert', 'got cert');
      }, assert.fail);
  });

  it('#with service option', function() {
    return accountHelper
      .newVerifiedAccount()
      .then(function(account) {
        var publicKey = {
          algorithm: 'RS',
          n:
            '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
          e: '65537',
        };
        var duration = 86400000;

        return respond(
          client.certificateSign(
            account.signIn.sessionToken,
            publicKey,
            duration,
            {
              service: 'wibble',
            }
          ),
          RequestMocks.certificateSign
        );
      })
      .then(function(res) {
        assert.ok(res);
      }, assert.fail);
  });
});
