/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Tells the server to emit the `flow.${viewName}.begin` event.

import FlowEventsMixin from './flow-events-mixin';

export default {
  dependsOn: [FlowEventsMixin],

  afterRender() {
    this.logFlowEventOnce('begin');
  },
};
