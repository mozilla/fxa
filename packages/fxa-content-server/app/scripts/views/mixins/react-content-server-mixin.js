/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ReactContentServerExperimentMixin from '../../views/mixins/react-content-server-experiment-mixin';

export default {
  dependsOn: [ReactContentServerExperimentMixin],

  setInitialContext(context) {
    context.set({
      isInReactContentServerExperiment: this.isInReactContentServerExperimentGroup(),
    });
  },
};
