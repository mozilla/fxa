/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Get the features that should be enabled when sending an SMS.
 *
 * @mixin SmsMixin
 */

define((require, exports, module) => {
  'use strict';

  const ExperimentMixin = require('./experiment-mixin');

  module.exports = {
    dependsOn: [ ExperimentMixin ],

    /**
     * Get the features that should be enabled when sending an SMS
     *
     * @returns {String[]}
     */
    getSmsFeatures () {
      const features = [];
      if (this.isInExperimentGroup('sendSms', 'signinCodes')) {
        features.push('signinCodes');
      }
      return features;
    }
  };
});
