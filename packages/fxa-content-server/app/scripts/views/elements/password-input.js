/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../../lib/auth-errors');
  const Vat = require('../../lib/vat');

  return {
    match ($el) {
      const type = $el.attr('type');
      return type === 'password' ||
             (type === 'text' && $el.hasClass('password'));
    },

    validate () {
      const value = this.val();

      if (! value) {
        throw AuthErrors.toError('PASSWORD_REQUIRED');
      } else if (Vat.password().validate(value).error) {
        throw AuthErrors.toError('PASSWORD_TOO_SHORT');
      }
    }
  };
});
