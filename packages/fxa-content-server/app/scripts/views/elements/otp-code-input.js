/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import textInput from './text-input';
import Vat from '../../lib/vat';

const element = Object.create(textInput);

element.match = function($el) {
  return $el.attr('type') === 'text' && $el.hasClass('otp-code');
};

element.val = function(val) {
  if (arguments.length === 1) {
    return this.__val(val.replace(/ /g, ''));
  }

  return this.__val().replace(/ /g, '');
};

element.validate = function() {
  const value = this.val();

  if (!value.length) {
    throw AuthErrors.toError('OTP_CODE_REQUIRED');
  } else if (Vat.totpCode().validate(value).error) {
    throw AuthErrors.toError('INVALID_OTP_CODE');
  }
};

export default element;
