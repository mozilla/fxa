/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'underscore',
  'lib/experiments/base'
], function (_, BaseExperiment) {
  'use strict';

  function OpenGmailExperiment() {
    // constructor
  }

  var createSaveStateDelegate = BaseExperiment.createSaveStateDelegate;

  _.extend(OpenGmailExperiment.prototype, new BaseExperiment(), {
    notifications: {
      'openGmail.clicked': createSaveStateDelegate('clicked'),
      'openGmail.triggered': createSaveStateDelegate('triggered'),
      'verification.success': '_onVerificationSuccess'
    },

    initialize: function (name, options) {
      if (! name || ! options || ! options.account) {
        return false;
      }

      options.extraAbleOptions = {
        email: options.account.get('email')
      };

      return BaseExperiment.prototype.initialize.call(this, name, options);
    },

    _onVerificationSuccess: function () {
      this.saveState('verified');

      if (this.hasState('clicked')) {
        this.saveState('clicked.verified');
      }

      if (this.hasState('triggered')) {
        this.saveState('triggered.verified');
      }
    }
  });

  return OpenGmailExperiment;
});
