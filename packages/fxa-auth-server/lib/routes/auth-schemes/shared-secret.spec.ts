/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/auth-schemes/shared-secret.js (Mocha → Jest).
 */

import sinon from 'sinon';
import { AppError } from '@fxa/accounts/errors';

const SharedSecretScheme = require('./shared-secret');
const authStrategy = SharedSecretScheme.strategy('goodsecret')();
const noThrowStrategy = SharedSecretScheme.strategy('goodsecret', {
  throwOnFailure: false,
})();

describe('lib/routes/auth-schemes/shared-secret', () => {
  it('should throws an invalid token error if the secrets do not match', () => {
    const request = { headers: { authorization: 'badsecret' } };

    try {
      authStrategy.authenticate(request, {});
      throw new Error('Unmatching secrets should have thrown an error');
    } catch (err: any) {
      expect(err).toEqual(AppError.invalidToken());
    }
  });

  it('should call authenticated when the secrets match', () => {
    const faker = sinon.fake();
    const request = { headers: { authorization: 'goodsecret' } };
    authStrategy.authenticate(request, { authenticated: faker });
    expect(faker.calledOnceWith({ credentials: {} })).toBe(true);
  });

  it('should not throw if the secrets do not match', () => {
    const request = { headers: { authorization: 'badsecret' } };

    try {
      const error = noThrowStrategy.authenticate(request, {});
      expect(error.isBoom).toBe(true);
      expect(error.isMissing).toBe(true);
    } catch (err) {
      throw new Error('No error should have been thrown');
    }
  });
});
