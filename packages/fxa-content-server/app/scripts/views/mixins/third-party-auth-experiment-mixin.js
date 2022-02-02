/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ExperimentMixin from './experiment-mixin';
const EXPERIMENT_NAME = 'thirdPartyAuth';

export default {
  dependsOn: [ExperimentMixin],

  isInThirdPartyAuthExperiment() {
    const experimentGroup = this.getAndReportExperimentGroup(EXPERIMENT_NAME, {
      clientId: this.relier.get('clientId'),
    });

    return experimentGroup === 'google';
  },
};
