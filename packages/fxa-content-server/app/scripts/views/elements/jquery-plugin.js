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
define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const checkboxInput = require('./checkbox-input');
  const coppaAgeInput = require('./coppa-age-input');
  const defaultElement = require('./default');
  const emailInput = require('./email-input');
  const passwordInput = require('./password-input');
  const recoveryCodeInput = require('./recovery-code-input');
  const recoveryKeyInput = require('./recovery-key-input');
  const telInput = require('./tel-input');
  const textInput = require('./text-input');
  const totpCodeInput = require('./totp-code-input');
  const unblockCodeInput = require('./unblock-code-input');

  const elementHelpers = [
    totpCodeInput,
    recoveryCodeInput,
    recoveryKeyInput,
    checkboxInput,
    coppaAgeInput,
    emailInput,
    passwordInput,
    unblockCodeInput,
    telInput,
    textInput,
    defaultElement // defaultElement is last since it is the fallback.
  ];

  function getHelper($el) {
    return _.find(elementHelpers, (elementHelper) => elementHelper.match($el));
  }

  $.fn.validate = function () {
    return getHelper(this).validate.call(this);
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
});
