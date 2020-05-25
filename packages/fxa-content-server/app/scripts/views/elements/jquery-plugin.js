/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * jQuery plugin to upgrade jQuery elements with two functions:
 *
 * 1. `val` - overridden in some cases to do input cleanup
 * 2. `validate` - validate the element value. If valid, returns falsy value,
 *    if invalid, returns an Error
 */
import $ from 'jquery';
import _ from 'underscore';
import checkboxInput from './checkbox-input';
import coppaAgeInput from './coppa-age-input';
import defaultElement from './default';
import emailInput from './email-input';
import passwordInput from './password-input';
import recoveryCodeInput from './recovery-code-input';
import recoveryKeyInput from './recovery-key-input';
import telInput from './tel-input';
import textInput from './text-input';
import totpCodeInput from './totp-code-input';
import tokenCodeInput from './otp-code-input';
import unblockCodeInput from './unblock-code-input';

const elementHelpers = [
  totpCodeInput,
  tokenCodeInput,
  recoveryCodeInput,
  recoveryKeyInput,
  checkboxInput,
  coppaAgeInput,
  emailInput,
  passwordInput,
  unblockCodeInput,
  telInput,
  textInput,
  defaultElement, // defaultElement is last since it is the fallback.
];

function getHelper($el) {
  return _.find(elementHelpers, (elementHelper) => elementHelper.match($el));
}

$.fn.validate = function () {
  if (this.data('validate')) {
    // the element has a custom validator attached to it,
    // probably from a view. Depend on the validator instead
    // of the standard validation functions.
    return this.data('validate')();
  } else {
    return getHelper(this).validate.call(this);
  }
};

$.fn.__val = $.fn.val;
$.fn.val = function () {
  const elementHelper = getHelper(this);

  if (elementHelper.val) {
    return elementHelper.val.apply(this, arguments);
  } else {
    return $.fn.__val.apply(this, arguments);
  }
};
