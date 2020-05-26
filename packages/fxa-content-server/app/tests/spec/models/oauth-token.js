/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import OAuthToken from 'models/oauth-token';
import sinon from 'sinon';

var assert = chai.assert;

describe('models/oauth-token', function () {
  var oAuthClient;
  var oAuthToken;

  beforeEach(function () {
    oAuthClient = {
      destroyToken: sinon.spy(function () {
        return Promise.resolve();
      }),
    };

    oAuthToken = new OAuthToken({
      oAuthClient: oAuthClient,
      token: 'access_token',
    });
  });

  describe('get', function () {
    it('returns the token', function () {
      assert.equal(oAuthToken.get('token'), 'access_token');
    });
  });

  describe('destroy', function () {
    it('destroys the token', function () {
      return oAuthToken.destroy().then(function () {
        assert.isTrue(oAuthClient.destroyToken.calledWith('access_token'));
      });
    });
  });
});
