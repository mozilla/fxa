/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Get the features that should be enabled when sending an SMS.
 *
 * @mixin SmsMixin
 */

import ExperimentMixin from './experiment-mixin';

export default {
  dependsOn: [ExperimentMixin],

  /**
   * Get the features that should be enabled when sending an SMS
   *
   * @returns {String[]}
   */
  getSmsFeatures() {
    // If SMS is enabled for a user, always send a signinCode.
    return ['signinCodes'];
  },
};
