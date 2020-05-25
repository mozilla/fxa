/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import textInput from './text-input';
import Vat from '../../lib/vat';

const element = Object.create(textInput);

element.match = function ($el) {
  return $el.attr('type') === 'text' && $el.hasClass('recovery-key');
};

element.val = function (val) {
  if (arguments.length === 1) {
    return this.__val(val);
  }

  // Recovery key is displayed to the user with spaces every 4
  // characters, replace them with empty spaces.
  return this.__val().replace(/ /g, '').toUpperCase();
};

element.validate = function () {
  const value = this.val();

  if (!value.length) {
    throw AuthErrors.toError('RECOVERY_KEY_REQUIRED');
  } else if (Vat.base32().validate(value).error) {
    throw AuthErrors.toError('INVALID_RECOVERY_KEY');
  }
};

export default element;
