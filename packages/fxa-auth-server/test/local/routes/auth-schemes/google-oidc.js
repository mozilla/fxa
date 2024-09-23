/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import sinon from 'sinon';
import proxyquire from 'proxyquire';
import AppError from '../../../../lib/error';

let verifyIdTokenStub;
const GoogleOIDCScheme = proxyquire(
  '../../../../lib/routes/auth-schemes/google-oidc',
  {
    'google-auth-library': {
      OAuth2Client: class OAuth2Client {
        constructor() {}
        verifyIdToken(...args) {
          return verifyIdTokenStub.apply(null, args);
        }
      },
    },
  }
);

const googleOIDCStrategy = GoogleOIDCScheme.strategy({
  aud: 'cloud-tasks',
  serviceAccountEmail: 'testo@iam.gcp.g.co',
})();

describe('lib/routes/auth-schemes/shared-secret', () => {
  beforeEach(() => {
    verifyIdTokenStub = sinon.stub().resolves({});
  });

  it('throws when the bearer token is missing', async () => {
    const request = { headers: {} };

    try {
      await googleOIDCStrategy.authenticate(request, {});
      assert.fail('Missing bearer token');
    } catch (err) {
      assert.deepEqual(err, AppError.unauthorized('Bearer token not provided'));
    }
  });

  it('throws when the id token is invalid', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    verifyIdTokenStub = sinon.stub().rejects(new Error('invalid id token'));

    try {
      await googleOIDCStrategy.authenticate(request, {});
      assert.fail('Invalid id token');
    } catch (err) {
      assert.deepEqual(
        err,
        AppError.unauthorized(`Bearer token invalid: invalid id token`)
      );
    }
  });

  it('throws when the service account email does not match', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    verifyIdTokenStub = sinon
      .stub()
      .resolves({ getPayload: () => ({ email: 'failing' }) });

    try {
      await googleOIDCStrategy.authenticate(request, {});
      assert.fail('Invalid id token');
    } catch (err) {
      assert.deepEqual(
        err,
        AppError.unauthorized(
          `Bearer token invalid: Email address does not match.`
        )
      );
    }
  });

  it('authenticates successfully', async () => {
    const request = { headers: { authorization: 'Bearer eeff.00.00' } };
    const h = { authenticated: sinon.stub() };
    verifyIdTokenStub = sinon
      .stub()
      .resolves({ getPayload: () => ({ email: 'testo@iam.gcp.g.co' }) });

    try {
      await googleOIDCStrategy.authenticate(request, h);
      sinon.assert.calledOnceWithExactly(h.authenticated, {
        credentials: { email: 'testo@iam.gcp.g.co' },
      });
      sinon.assert.calledOnceWithExactly(verifyIdTokenStub, {
        idToken: 'eeff.00.00',
        audience: 'cloud-tasks',
      });
    } catch (err) {
      assert.fail('Test should have passed');
    }
  });
});
