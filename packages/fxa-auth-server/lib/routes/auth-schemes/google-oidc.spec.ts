/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';

let verifyIdTokenStub: jest.Mock = jest.fn().mockResolvedValue({});

jest.mock('google-auth-library', () => ({
  OAuth2Client: class OAuth2Client {
    constructor() {}
    verifyIdToken(...args: any[]) {
      return verifyIdTokenStub(...args);
    }
  },
}));

const GoogleOIDCScheme = require('./google-oidc');

const googleOIDCStrategy = GoogleOIDCScheme.strategy({
  aud: 'cloud-tasks',
  serviceAccountEmail: 'testo@iam.gcp.g.co',
})();

describe('lib/routes/auth-schemes/google-oidc', () => {
  beforeEach(() => {
    verifyIdTokenStub = jest.fn().mockResolvedValue({});
  });

  it('throws when the bearer token is missing', async () => {
    const request = { headers: {} };

    try {
      await googleOIDCStrategy.authenticate(request, {});
      throw new Error('Missing bearer token');
    } catch (err: any) {
      expect(err).toEqual(AppError.unauthorized('Bearer token not provided'));
    }
  });

  it('throws when the id token is invalid', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    verifyIdTokenStub = jest
      .fn()
      .mockRejectedValue(new Error('invalid id token'));

    try {
      await googleOIDCStrategy.authenticate(request, {});
      throw new Error('Invalid id token');
    } catch (err: any) {
      expect(err).toEqual(
        AppError.unauthorized(`Bearer token invalid: invalid id token`)
      );
    }
  });

  it('throws when the service account email does not match', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    verifyIdTokenStub = jest
      .fn()
      .mockResolvedValue({ getPayload: () => ({ email: 'failing' }) });

    try {
      await googleOIDCStrategy.authenticate(request, {});
      throw new Error('Invalid id token');
    } catch (err: any) {
      expect(err).toEqual(
        AppError.unauthorized(
          `Bearer token invalid: Email address does not match.`
        )
      );
    }
  });

  it('authenticates successfully', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    const h = { authenticated: jest.fn() };
    verifyIdTokenStub = jest.fn().mockResolvedValue({
      getPayload: () => ({ email: 'testo@iam.gcp.g.co' }),
    });

    await googleOIDCStrategy.authenticate(request, h);
    expect(h.authenticated).toHaveBeenCalledTimes(1);
    expect(h.authenticated).toHaveBeenCalledWith({
      credentials: { email: 'testo@iam.gcp.g.co' },
    });
    expect(verifyIdTokenStub).toHaveBeenCalledTimes(1);
    expect(verifyIdTokenStub).toHaveBeenCalledWith({
      idToken: 'eeff.00.00',
      audience: 'cloud-tasks',
    });
  });
});
