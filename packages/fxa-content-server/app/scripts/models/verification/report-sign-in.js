/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold report-sign-in data.
 */

'use strict';

import Vat from '../../lib/vat';
import VerificationInfo from './base';

module.exports = VerificationInfo.extend({
  defaults: {
    uid: null,
    unblockCode: null
  },

  validation: {
    uid: Vat.uid().required(),
    unblockCode: Vat.unblockCode().required()
  }
});
