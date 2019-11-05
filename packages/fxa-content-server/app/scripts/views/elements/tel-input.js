/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../../lib/auth-errors';
import CountryTelephoneInfo from '../../lib/country-telephone-info';
import textInput from './text-input';

const DEFAULT_COUNTRY = 'US';

const element = Object.create(textInput);

element.match = function($el) {
  return $el.attr('type') === 'tel';
};

element.val = function(val) {
  if (arguments.length === 1) {
    return this.__val(val);
  }

  return this.__val().replace(/[.,()\s-]/g, '');
};

element.validate = function() {
  const isRequired = typeof this.attr('required') !== 'undefined';
  const value = this.val();
  const len = value.length;
  const country = this.data('country') || DEFAULT_COUNTRY;
  const validationPattern = CountryTelephoneInfo[country].pattern;

  if (! len && isRequired) {
    throw AuthErrors.toError('PHONE_NUMBER_REQUIRED');
  } else if (len && ! validationPattern.test(value)) {
    // only validate if input available
    throw AuthErrors.toError('INVALID_PHONE_NUMBER');
  }
};

export default element;
