/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Email information
 */

define(function (require, exports, module) {
  'use strict';

  const Backbone = require('backbone');

  var Email = Backbone.Model.extend({
    defaults: {
      email: null,
      isPrimary: false,
      verified: false
    },
  });

  module.exports = Email;
});

