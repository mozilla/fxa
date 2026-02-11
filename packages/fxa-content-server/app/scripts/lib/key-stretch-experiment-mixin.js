/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import ExperimentMixin from '../views/mixins/experiment-mixin';

 export default {
   dependsOn: [ExperimentMixin],

   isInKeyStretchExperiment() {
     const experimentGroup = this.getAndReportExperimentGroup('keyStretchV2');
     return experimentGroup === 'v2';
   },
 };
