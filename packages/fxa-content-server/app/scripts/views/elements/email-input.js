/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../../lib/auth-errors');
  const Vat = require('../../lib/vat');

  return {
    match ($el) {
      return $el.attr('type') === 'email';
    },

    val (val) {
      if (arguments.length === 1) {
        return this.__val(val);
      }

      return this.__val().trim();
    },

    validate () {
      const value = this.val();

      if (! value) {
        throw AuthErrors.toError('EMAIL_REQUIRED');
      } else if (Vat.email().validate(value).error) {
        throw AuthErrors.toError('INVALID_EMAIL');
      }
    }
  };
});
