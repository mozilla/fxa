/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const error = require('../../lib/error');
const schemeRefreshToken = require('../../lib/scheme-refresh-token');
const sinon = require('sinon');

const OAUTH_CLIENT_ID = '3c49430b43dfba77';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';

describe('lib/scheme-refresh-token', () => {
  let config;
  let db;
  let oauthdb;
  let response;

  beforeEach(() => {
    config = { oauth: {} };

    db = {
      devices: sinon.spy(() => Promise.resolve([
        {
          id: '5eb89097bab6551de3614facaea59cab',
          refreshTokenId: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7',
          isCurrentDevice: false,
          location: {},
          name: 'first device',
          type: 'mobile',
          pushCallback: null,
          pushPublicKey: null,
          pushAuthKey: null,
          pushEndpointExpired: false,
          availableCommands: {},
          lastAccessTime: 1552338763337,
          lastAccessTimeFormatted: 'a few seconds ago'
        }
      ]))
    };

    oauthdb = {
      checkRefreshToken: sinon.spy(() => () => Promise.resolve({})),
      getClientInfo: sinon.spy(() => Promise.resolve({
        id: OAUTH_CLIENT_ID,
        name: OAUTH_CLIENT_NAME,
        trusted: true,
        image_uri: '',
        redirect_uri: `http://127.0.0.1:3030/oauth/success/${OAUTH_CLIENT_ID}`
      })),
    };

    response = {
      unauthenticated: sinon.spy(() => {}),
      authenticated: sinon.spy(() => {})
    };
  });

  it('handles bad authorization header', async () => {
    const scheme = schemeRefreshToken(config);
    try {
      await scheme().authenticate({
        headers: {
          authorization: 'Bad Auth'
        }
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.message, 'Invalid parameter in request body');
    }
  });

  it('handles bad refresh token format', async () => {
    const scheme = schemeRefreshToken(config);
    try {
      await scheme().authenticate({
        headers: {
          authorization: 'Bearer Foo'
        }
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.message, 'Invalid parameter in request body');
    }
  });

  it('works with a good authorization header', async () => {
    const scheme = schemeRefreshToken(config, db, oauthdb);
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isTrue(response.unauthenticated.calledOnce);
    assert.isFalse(response.authenticated.calledOnce);
  });

  it('authenticates with devices', async () => {
    oauthdb.checkRefreshToken = sinon.spy(() => Promise.resolve({
      active: true,
      scope: 'https://identity.mozilla.com/apps/oldsync',
      sub: '620203b5773b4c1d968e1fd4505a6885',
      jti: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7'
    }));

    const scheme = schemeRefreshToken(config, db, oauthdb);
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isFalse(response.unauthenticated.called);
    assert.isTrue(response.authenticated.calledOnce);
    assert.deepEqual(response.authenticated.args[0][0].credentials, {
      uid: '620203b5773b4c1d968e1fd4505a6885',
      tokenVerified: true,
      deviceId: '5eb89097bab6551de3614facaea59cab',
      deviceName: 'first device',
      deviceType: 'mobile',
      client: {
        id: OAUTH_CLIENT_ID,
        image_uri: '',
        name: OAUTH_CLIENT_NAME,
        redirect_uri: `http://127.0.0.1:3030/oauth/success/${OAUTH_CLIENT_ID}`,
        trusted: true
      },
      refreshTokenId: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7',
      deviceAvailableCommands: {},
      deviceCallbackAuthKey: undefined,
      deviceCallbackIsExpired: undefined,
      deviceCallbackPublicKey: undefined,
      deviceCallbackURL: undefined,
      deviceCreatedAt: undefined,
    });
  });

  it('requires an approved scope to authenticate', async () => {
    oauthdb.checkRefreshToken = sinon.spy(() => Promise.resolve({
      active: true,
      scope: 'profile',
      sub: '620203b5773b4c1d968e1fd4505a6885',
      jti: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7'
    }));

    const scheme = schemeRefreshToken(config, db, oauthdb);
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 400);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_SCOPES);

    assert.isFalse(response.authenticated.calledOnce);
  });

  it('requires an known refresh token to authenticate', async () => {
    oauthdb.checkRefreshToken = sinon.spy(() => Promise.resolve());

    const scheme = schemeRefreshToken(config, db, oauthdb);
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });


  it('requires an active refresh token to authenticate', async () => {
    oauthdb.checkRefreshToken = sinon.spy(() => Promise.resolve({
      active: false,
      scope: 'https://identity.mozilla.com/apps/oldsync',
      sub: '620203b5773b4c1d968e1fd4505a6885',
      jti: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7'
    }));

    const scheme = schemeRefreshToken(config, db, oauthdb);
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });

  it('can be preffed off via feature-flag', async () => {
    oauthdb.checkRefreshToken = sinon.spy(() => Promise.resolve({
      active: false,
      scope: 'https://identity.mozilla.com/apps/oldsync',
      sub: '620203b5773b4c1d968e1fd4505a6885',
      jti: '40f61392cf69b0be709fbd3122d0726bb32247b476b2a28451345e7a5555cec7'
    }));

    config.oauth.deviceAccessEnabled = false;
    const scheme = schemeRefreshToken(config, db, oauthdb);
    try {
      await scheme().authenticate({
        headers: {
          authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
        }
      }, response);
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
    }
    assert.isTrue(response.unauthenticated.notCalled);
    assert.isTrue(oauthdb.checkRefreshToken.notCalled);

    config.oauth.deviceAccessEnabled = true;
    await scheme().authenticate({
      headers: {
        authorization: 'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78'
      }
    }, response);

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });

});
