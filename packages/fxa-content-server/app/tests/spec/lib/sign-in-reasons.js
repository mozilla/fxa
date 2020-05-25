/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import SIGN_IN_REASONS from 'lib/sign-in-reasons';

describe('lib/sign-in-reasons', function () {
  it('exports correct strings', function () {
    assert.lengthOf(Object.keys(SIGN_IN_REASONS), 4);
    assert.equal(SIGN_IN_REASONS.PASSWORD_CHANGE, 'password_change');
    assert.equal(SIGN_IN_REASONS.PASSWORD_CHECK, 'password_check');
    assert.equal(SIGN_IN_REASONS.PASSWORD_RESET, 'password_reset');
    assert.equal(SIGN_IN_REASONS.SIGN_IN, 'signin');
  });
});
