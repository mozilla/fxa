/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { queryStringToGenericData } from '../../../lib/model-data';
import { IndexQueryParams } from './query-params';

/**
 * These tests spot check certain validation rules. We don't necessary want to revalidate that
 * the class-validator works, but there are certain params that we might want to keep an eye on
 * due to curve balls thrown in the past.
 */

describe('SigninQueryParams checks', function () {
  function validate(query: string) {
    return new IndexQueryParams(queryStringToGenericData(query)).tryValidate();
  }

  it('checks email', () => {
    // TBD? Should we support non uri encoded components?
    expect(validate('email=test+test@gmail.com').isValid).toBeFalsy();
    expect(validate('email=test%2Btest%40gmail.com').isValid).toBeTruthy(); // supports uri encoding
    expect(validate('email=test%2Btest-gmail.com').isValid).toBeFalsy(); // missing @
  });

  it('checks loginHint', () => {
    // TBD? Should we support non uri encoded components?
    expect(validate('login_hint=test+test@gmail.com').isValid).toBeFalsy();
    expect(validate('login_hint=test%2Btest%40gmail.com').isValid).toBeTruthy(); // supports uri encoding
    expect(validate('login_hint=test%2Btest-gmail.com').isValid).toBeFalsy(); // missing @
  });
});
