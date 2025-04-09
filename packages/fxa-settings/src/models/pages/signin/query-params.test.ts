/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { queryStringToGenericData } from '../../../lib/model-data';
import { SigninQueryParams } from './query-params';

/**
 * These tests spot check certain validation rules. We don't necessary want to revalidate that
 * the class-validator works, but there are certain params that we might want to keep an eye on
 * due to curve balls thrown in the past.
 */

describe('SigninQueryParams checks', function () {
  function validate(query: string) {
    return new SigninQueryParams(queryStringToGenericData(query)).tryValidate();
  }

  it('checks email', () => {
    expect(validate('email=test+test@gmail.com').isValid).toBeFalsy();
    expect(validate('email=test%2Btest%40gmail.com').isValid).toBeTruthy(); // supports uri encoding
    expect(validate('email=test%2Btest-gmail.com').isValid).toBeFalsy(); // missing @
  });

  it('checks redirect uri', () => {
    expect(
      validate('redirectTo=https://localhost:3030/app?foo=bar').isValid
    ).toBeTruthy();
    expect(
      validate('redirectTo=tps://localhost:3030/app?foo=bar').isValid
    ).toBeFalsy();
    expect(
      validate('redirectTo=urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel')
        .isValid
    ).toBeFalsy();
  });
});
