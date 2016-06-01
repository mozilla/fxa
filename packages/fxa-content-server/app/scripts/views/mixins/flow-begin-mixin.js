/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Tells the server to emit the `flow.begin` activity event.

define(function (require, exports, module) {
  'use strict';

  var Flow = require('models/flow');

  module.exports = {
    afterRender: function () {
      var self = this;

      self.flow = new Flow({
        sentryMetrics: self.sentryMetrics,
        window: self.window
      });

      var flowId = self.flow.get('flowId');
      var flowBegin = self.flow.get('flowBegin');

      self.metrics.setActivityEventMetadata({
        flowBeginTime: flowBegin,
        flowId: flowId
      });
      self.metrics.logFlowBegin(flowId, flowBegin);
    }
  };
});
