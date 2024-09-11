/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import AppError from '../../../../lib/error';
import * as SharedSecretScheme from '../../../../lib/routes/auth-schemes/shared-secret';
const authStrategy = SharedSecretScheme.strategy('goodsecret')();
const noThrowStrategy = SharedSecretScheme.strategy('goodsecret', {
  throwOnFailure: false,
})();
import sinon from 'sinon';

describe('lib/routes/auth-schemes/shared-secret', () => {
  it('should throws an invalid token error if the secrets do not match', () => {
    const request = { headers: { authorization: 'badsecret' } };

    try {
      authStrategy.authenticate(request, {});
      assert.fail('Unmatching secrets should have thrown an error');
    } catch (err) {
      assert.deepEqual(err, AppError.invalidToken());
    }
  });

  it('should call authenticated when the secrets match', () => {
    const faker = sinon.fake();
    const request = { headers: { authorization: 'goodsecret' } };
    authStrategy.authenticate(request, { authenticated: faker });
    assert.isTrue(faker.calledOnceWith({ credentials: {} }));
  });

  it('should not throw if the secrets do not match', () => {
    const request = { headers: { authorization: 'badsecret' } };

    try {
      const error = noThrowStrategy.authenticate(request, {});
      assert.isTrue(error.isBoom);
      assert.isTrue(error.isMissing);
    } catch (err) {
      assert.fail('No error should have been thrown');
    }
  });
});
