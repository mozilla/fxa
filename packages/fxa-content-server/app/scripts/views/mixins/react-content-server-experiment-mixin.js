/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 import ExperimentMixin from './experiment-mixin';
 const EXPERIMENT_NAME = 'reactContentServer';

 export default {
   dependsOn: [ExperimentMixin],

   isInReactContentServerExperimentGroup() {
     const experimentGroup = this.getAndReportExperimentGroup(EXPERIMENT_NAME);
     return experimentGroup;
   },
 };
