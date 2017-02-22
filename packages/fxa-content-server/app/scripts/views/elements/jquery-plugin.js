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
  const checkboxInput = require('views/elements/checkbox-input');
  const defaultElement = require('views/elements/default');
  const emailInput = require('views/elements/email-input');
  const passwordInput = require('views/elements/password-input');
  const telInput = require('views/elements/tel-input');
  const textInput = require('views/elements/text-input');
  const unblockCodeInput = require('views/elements/unblock-code-input');

  const elementHelpers = [
    checkboxInput,
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
