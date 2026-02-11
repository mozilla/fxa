/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold sign up verification data
 */

import Vat from '../../lib/vat';
import VerificationInfo from './base';

export default VerificationInfo.extend({
  defaults: {
    code: null,
    reminder: null,
    type: null,
    uid: null,
  },

  validation: {
    code: Vat.verificationCode().required(),
    uid: Vat.uid().required(),
  },
});
