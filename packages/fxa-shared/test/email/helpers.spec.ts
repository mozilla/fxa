/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as emailLib from '@fxa/shared/email';
import * as helpers from '../../email/helpers';
import topEmailDomains from '../../email/topEmailDomains';

describe('email shims', () => {
  it('re-export the @fxa/shared/email helpers', () => {
    assert.strictEqual(helpers.normalizeEmail, emailLib.normalizeEmail);
    assert.strictEqual(helpers.emailsMatch, emailLib.emailsMatch);
    assert.strictEqual(helpers.isEmailValid, emailLib.isEmailValid);
    assert.strictEqual(helpers.isEmailMask, emailLib.isEmailMask);
  });

  it('re-export TopEmailDomains as the default export', () => {
    assert.strictEqual(topEmailDomains, emailLib.TopEmailDomains);
  });
});
