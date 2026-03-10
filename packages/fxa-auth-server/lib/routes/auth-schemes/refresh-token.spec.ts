/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/auth-schemes/refresh-token.js (Mocha → Jest).
 * Replaced proxyquire with jest.mock for oauth/db and oauth/client.
 */

import sinon from 'sinon';
import { AppError as error } from '@fxa/accounts/errors';

const OAUTH_CLIENT_ID = '3c49430b43dfba77';
const OAUTH_CLIENT_NAME = 'Android Components Reference Browser';

jest.mock('../../oauth/db', () => ({
  getRefreshToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../oauth/client', () => ({
  getClientById: jest.fn().mockResolvedValue({
    id: '3c49430b43dfba77',
    name: 'Android Components Reference Browser',
    trusted: true,
    image_uri: '',
    redirect_uri: 'http://localhost:3030/oauth/success/3c49430b43dfba77',
    publicClient: true,
  }),
}));

const oauthDB = require('../../oauth/db');
const ScopeSet = require('fxa-shared/oauth/scopes').scopeSetHelpers;
const schemeRefreshToken = require('./refresh-token');

const USER_ID = Buffer.from('620203b5773b4c1d968e1fd4505a6885', 'hex');

describe('lib/routes/auth-schemes/refresh-token', () => {
  let config: any;
  let db: any;
  let response: any;
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
      deviceFromRefreshTokenId: sinon.spy(() =>
        Promise.resolve({
          id: '5eb89097bab6551de3614facaea59cab',
          refreshTokenId:
            '5b541d00ea0c0dc775e060c95a1ee7ca617cf95a05d177ec09fd6f62ca9b2913',
          isCurrentDevice: false,
          location: {},
          name: 'first device',
          type: 'mobile',
          createdAt: 1716230400000,
          callbackURL: 'https://example.com/callback',
          callbackPublicKey: 'public_key',
          callbackAuthKey: 'auth_key',
          callbackIsExpired: false,
          availableCommands: {},
        })
      ),
    };

    response = {
      unauthenticated: sinon.spy(() => {}),
      authenticated: sinon.spy(() => {}),
    };

    // Reset the mock to default (token not found)
    oauthDB.getRefreshToken.mockReset();
    oauthDB.getRefreshToken.mockResolvedValue(undefined);
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
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Invalid parameter in request body');
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
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.message).toBe('Invalid parameter in request body');
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

    expect(response.unauthenticated.calledOnce).toBe(true);
    expect(response.authenticated.calledOnce).toBe(false);
  });

  it('authenticates with devices', async () => {
    oauthDB.getRefreshToken.mockResolvedValue({
      scope: ScopeSet.fromString('https://identity.mozilla.com/apps/oldsync'),
      userId: USER_ID,
    });

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

    expect(response.unauthenticated.called).toBe(false);
    expect(response.authenticated.calledOnce).toBe(true);
    expect(response.authenticated.args[0][0].credentials).toEqual({
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
      deviceCallbackAuthKey: 'auth_key',
      deviceCallbackIsExpired: false,
      deviceCallbackPublicKey: 'public_key',
      deviceCallbackURL: 'https://example.com/callback',
      deviceCreatedAt: 1716230400000,
      uaBrowser: app.ua.browser,
      uaBrowserVersion: app.ua.browserVersion,
      uaOS: app.ua.os,
      uaOSVersion: app.ua.osVersion,
      uaDeviceType: app.ua.deviceType,
      uaFormFactor: app.ua.formFactor,
    });
  });

  it('requires an approved scope to authenticate', async () => {
    oauthDB.getRefreshToken.mockResolvedValue({
      scope: ScopeSet.fromString('profile'),
      userId: USER_ID,
    });

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

    expect(response.unauthenticated.calledOnce).toBe(true);
    const args = response.unauthenticated.args[0][0];
    expect(args.output.statusCode).toBe(400);
    expect(args.output.payload.errno).toBe(error.ERRNO.INVALID_SCOPES);

    expect(response.authenticated.calledOnce).toBe(false);
  });

  it('requires an known refresh token to authenticate', async () => {
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

    expect(response.unauthenticated.calledOnce).toBe(true);
    const args = response.unauthenticated.args[0][0];
    expect(args.output.statusCode).toBe(401);
    expect(args.output.payload.errno).toBe(error.ERRNO.INVALID_TOKEN);

    expect(response.authenticated.calledOnce).toBe(false);
  });

  it('requires an active refresh token to authenticate', async () => {
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

    expect(response.unauthenticated.calledOnce).toBe(true);
    const args = response.unauthenticated.args[0][0];
    expect(args.output.statusCode).toBe(401);
    expect(args.output.payload.errno).toBe(error.ERRNO.INVALID_TOKEN);

    expect(response.authenticated.calledOnce).toBe(false);
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
      throw new Error('should have thrown');
    } catch (err: any) {
      expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
    }
    expect(response.unauthenticated.notCalled).toBe(true);

    oauthDB.getRefreshToken.mockResolvedValue(undefined);
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

    expect(response.unauthenticated.calledOnce).toBe(true);
    const args = response.unauthenticated.args[0][0];
    expect(args.output.statusCode).toBe(401);
    expect(args.output.payload.errno).toBe(error.ERRNO.INVALID_TOKEN);

    expect(response.authenticated.calledOnce).toBe(false);
  });
});
