/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import proxyquire from 'proxyquire';
import error from '../../../../lib/error';
import sinon from 'sinon';
import ScopeSetModule from "fxa-shared";
const ScopeSet = ScopeSetModule.oauth.scopes;

const USER_ID = Buffer.from('620203b5773b4c1d968e1fd4505a6885', 'hex');
const OAUTH_CLIENT_ID = '3c49430b43dfba77';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';
const oauthDB = { getRefreshToken: sinon.spy(() => Promise.resolve()) };
const schemeRefreshToken = proxyquire(
  '../../../../lib/routes/auth-schemes/refresh-token',
  {
    '../../oauth/db': oauthDB,
    '../../oauth/client': {
      getClientById: async function () {
        return {
          id: OAUTH_CLIENT_ID,
          name: OAUTH_CLIENT_NAME,
          trusted: true,
          image_uri: '',
          redirect_uri: `http://localhost:3030/oauth/success/${OAUTH_CLIENT_ID}`,
          publicClient: true,
        };
      },
    },
  }
);

describe('lib/routes/auth-schemes/refresh-token', () => {
  let config;
  let db;
  let response;
  const app = {
    ua: {
      browser: 'firefox',
      browserVersion: '100',
      os: 'iOS',
      osVersion: '16.2',
      deviceType: 'mobile',
      formFactor: null,
    },
  };

  beforeEach(() => {
    config = { oauth: {} };

    db = {
      devices: sinon.spy(() =>
        Promise.resolve([
          {
            id: '5eb89097bab6551de3614facaea59cab',
            refreshTokenId:
              '5b541d00ea0c0dc775e060c95a1ee7ca617cf95a05d177ec09fd6f62ca9b2913',
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
            lastAccessTimeFormatted: 'a few seconds ago',
          },
        ])
      ),
    };

    response = {
      unauthenticated: sinon.spy(() => {}),
      authenticated: sinon.spy(() => {}),
    };
  });

  it('handles bad authorization header', async () => {
    const scheme = schemeRefreshToken(config);
    try {
      await scheme().authenticate({
        headers: {
          authorization: 'Bad Auth',
        },
        app,
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
          authorization: 'Bearer Foo',
        },
        app,
      });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.message, 'Invalid parameter in request body');
    }
  });

  it('works with a good authorization header', async () => {
    const scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
        app,
      },
      response
    );

    assert.isTrue(response.unauthenticated.calledOnce);
    assert.isFalse(response.authenticated.calledOnce);
  });

  it('authenticates with devices', async () => {
    oauthDB.getRefreshToken = sinon.spy(() =>
      Promise.resolve({
        scope: ScopeSet.fromString('https://identity.mozilla.com/apps/oldsync'),
        userId: USER_ID,
      })
    );

    const scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
        app,
      },
      response
    );

    assert.isFalse(response.unauthenticated.called);
    assert.isTrue(response.authenticated.calledOnce);
    assert.deepEqual(response.authenticated.args[0][0].credentials, {
      uid: '620203b5773b4c1d968e1fd4505a6885',
      tokenVerified: true,
      emailVerified: true,
      deviceId: '5eb89097bab6551de3614facaea59cab',
      deviceName: 'first device',
      deviceType: 'mobile',
      client: {
        id: OAUTH_CLIENT_ID,
        image_uri: '',
        name: OAUTH_CLIENT_NAME,
        redirect_uri: `http://localhost:3030/oauth/success/${OAUTH_CLIENT_ID}`,
        trusted: true,
        publicClient: true,
      },
      refreshTokenId:
        '5b541d00ea0c0dc775e060c95a1ee7ca617cf95a05d177ec09fd6f62ca9b2913',
      deviceAvailableCommands: {},
      deviceCallbackAuthKey: undefined,
      deviceCallbackIsExpired: undefined,
      deviceCallbackPublicKey: undefined,
      deviceCallbackURL: undefined,
      deviceCreatedAt: undefined,
      uaBrowser: app.ua.browser,
      uaBrowserVersion: app.ua.browserVersion,
      uaOS: app.ua.os,
      uaOSVersion: app.ua.osVersion,
      uaDeviceType: app.ua.deviceType,
      uaFormFactor: app.ua.formFactor,
    });
  });

  it('requires an approved scope to authenticate', async () => {
    oauthDB.getRefreshToken = sinon.spy(() =>
      Promise.resolve({
        scope: ScopeSet.fromString('profile'),
        userId: USER_ID,
      })
    );

    const scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
      },
      response
    );

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 400);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_SCOPES);

    assert.isFalse(response.authenticated.calledOnce);
  });

  it('requires an known refresh token to authenticate', async () => {
    oauthDB.getRefreshToken = sinon.spy(() => Promise.resolve());

    const scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
        app,
      },
      response
    );

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });

  it('requires an active refresh token to authenticate', async () => {
    oauthDB.getRefreshToken = sinon.spy(() => Promise.resolve());

    const scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
        app,
      },
      response
    );

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });

  it('can be preffed off via feature-flag', async () => {
    config.oauth.deviceAccessEnabled = false;
    let scheme = schemeRefreshToken(config, db);
    try {
      await scheme().authenticate(
        {
          headers: {
            authorization:
              'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
          },
          app,
        },
        response
      );
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
    }
    assert.isTrue(response.unauthenticated.notCalled);

    oauthDB.getRefreshToken = sinon.spy(() => Promise.resolve());
    // eslint-disable-next-line require-atomic-updates
    config.oauth.deviceAccessEnabled = true;
    scheme = schemeRefreshToken(config, db);
    await scheme().authenticate(
      {
        headers: {
          authorization:
            'Bearer B53DF2CE2BDB91820CB0A5D68201EF87D8D8A0DFC11829FB074B6426F537EE78',
        },
      },
      response
    );

    assert.isTrue(response.unauthenticated.calledOnce);
    const args = response.unauthenticated.args[0][0];
    assert.strictEqual(args.output.statusCode, 401);
    assert.strictEqual(args.output.payload.errno, error.ERRNO.INVALID_TOKEN);

    assert.isFalse(response.authenticated.calledOnce);
  });
});
