/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to hold sign up verification data
 */

define(function (require, exports, module) {
  'use strict';

  var Validate = require('lib/validate');
  var VerificationInfo = require('./base');

  module.exports = VerificationInfo.extend({
    defaults: {
      code: null,
      reminder: null,
      uid: null
    },

    validation: {
      code: Validate.isCodeValid,
      uid: Validate.isUidValid
    }
  });
});

