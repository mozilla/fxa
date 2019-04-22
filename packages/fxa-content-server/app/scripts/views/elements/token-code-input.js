/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import textInput from './text-input';
import Vat from '../../lib/vat';

const element = Object.create(textInput);

element.match = function ($el) {
  return $el.attr('type') === 'number' && $el.hasClass('token-code');
};

element.val = function (val) {
  if (arguments.length === 1) {
    return this.__val(val.replace(/[- ]/g, ''));
  }

  return this.__val();
};

element.validate = function () {
  const value = this.val();

  if (! value.length) {
    throw AuthErrors.toError('TOKEN_VERIFICATION_CODE_REQUIRED');
  } else if (Vat.totpCode().validate(value).error) {
    throw AuthErrors.toError('INVALID_TOKEN_VERIFICATION_CODE');
  }
};

export default element;
