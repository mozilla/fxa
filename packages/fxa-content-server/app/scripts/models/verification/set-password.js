/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold account verification data for accounts created
 * without a password.
 */

import Vat from '../../lib/vat';
import VerificationInfo from './base';

export default VerificationInfo.extend({
  defaults: {
    code: null,
    token: null,
    email: null,
    productName: null,
    redirectUrl: null,
    service: null,
  },

  validation: {
    code: Vat.verificationCode(),
    token: Vat.token(),
    email: Vat.email(),
    redirectUrl: Vat.verificationRedirect(),
  },
});
