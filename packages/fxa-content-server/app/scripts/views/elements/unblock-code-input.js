/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import textInput from './text-input';
import Vat from '../../lib/vat';

const element = Object.create(textInput);

element.match = function ($el) {
  return $el.attr('type') === 'text' && $el.hasClass('unblock-code');
};

element.val = function (val) {
  if (arguments.length === 1) {
    return this.__val(val);
  }

  return this.__val().trim();
};

element.validate = function () {
  const isRequired = typeof this.attr('required') !== 'undefined';
  const value = this.val();

  if (isRequired && !value.length) {
    throw AuthErrors.toError('UNBLOCK_CODE_REQUIRED');
  } else if (Vat.unblockCode().validate(value).error) {
    throw AuthErrors.toError('INVALID_UNBLOCK_CODE');
  }
};

export default element;
