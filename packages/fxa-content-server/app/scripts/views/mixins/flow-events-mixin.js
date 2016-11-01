/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Populates the flow model and initialises flow event handlers.

define(function (require, exports, module) {
  'use strict';

  const Flow = require('models/flow');

  module.exports = {
    afterRender () {
      this.flow = new Flow({
        sentryMetrics: this.sentryMetrics,
        window: this.window
      });

      const flowId = this.flow.get('flowId');
      const flowBegin = this.flow.get('flowBegin');

      this.metrics.setFlowEventMetadata({
        flowBeginTime: flowBegin,
        flowId: flowId
      });
    }
  };
});
