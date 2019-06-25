/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import Vat from '../../lib/vat';

export default {
  match($el) {
    return $el.attr('type') === 'email';
  },

  val(val) {
    if (arguments.length === 1) {
      return this.__val(val);
    }

    return this.__val().trim();
  },

  validate() {
    const value = this.val();

    if (!value) {
      throw AuthErrors.toError('EMAIL_REQUIRED');
    } else if (Vat.email().validate(value).error) {
      throw AuthErrors.toError('INVALID_EMAIL');
    }
  },
};
