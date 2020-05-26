/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ExperimentMixin from './experiment-mixin';
const EXPERIMENT_NAME = 'newsletterSync';

export default {
  dependsOn: [ExperimentMixin],

  isInNewsletterSyncExperimentTreatment() {
    return (
      this.isInNewsletterSyncExperimentTrailheadCopy() ||
      this.isInNewsletterSyncExperimentNewCopy()
    );
  },

  isInNewsletterSyncExperimentTrailheadCopy() {
    const experimentGroup = this.getAndReportExperimentGroup(EXPERIMENT_NAME, {
      isSync: this.relier.isSync(),
      lang: this.navigator.language,
    });

    return experimentGroup === 'trailhead-copy';
  },

  isInNewsletterSyncExperimentNewCopy() {
    const experimentGroup = this.getAndReportExperimentGroup(EXPERIMENT_NAME, {
      isSync: this.relier.isSync(),
      lang: this.navigator.language,
    });

    return experimentGroup === 'new-copy';
  },
};
