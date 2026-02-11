/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold account recovery verification data.
 */

import Vat from '../../lib/vat';
import VerificationInfo from './base';

export default VerificationInfo.extend({
  defaults: {
    accountResetToken: null,
    kB: null,
    recoveryKeyId: null,
  },

  validation: {
    accountResetToken: Vat.hex().required(),
    kB: Vat.hex().required(),
    recoveryKeyId: Vat.hex().required(),
  },
});
