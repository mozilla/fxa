/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Get the features that should be enabled when sending an SMS.
 * Requires the SeachParamMixin
 */

define((require, exports, module) => {
  'use strict';

  module.exports = {
    /**
     * Get the features that should be enabled when sending an SMS
     *
     * @returns {String[]}
     */
    getSmsFeatures () {
      const features = [];
      if (this.relier.get('enableSigninCodes')) {
        features.push('signinCodes');
      }
      return features;
    }
  };
});
