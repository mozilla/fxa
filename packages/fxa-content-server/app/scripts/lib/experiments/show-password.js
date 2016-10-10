/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseExperiment = require('lib/experiments/base');

  var createSaveStateDelegate = BaseExperiment.createSaveStateDelegate;

  module.exports = BaseExperiment.extend({
    notifications: {
      'showPassword.clicked': createSaveStateDelegate('clicked'),
      'showPassword.triggered': createSaveStateDelegate('triggered'),
      'verification.success': '_onVerificationSuccess'
    },

    _onVerificationSuccess: function () {
      this.saveState('verified');

      // user verified after using show password
      if (this.hasState('clicked')) {
        this.saveState('clicked.verified');
      }

      if (this.hasState('triggered')) {
        this.saveState('triggered.verified');
      }
    }
  });

});
