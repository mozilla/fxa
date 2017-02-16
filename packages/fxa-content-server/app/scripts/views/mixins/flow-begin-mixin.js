/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Tells the server to emit the `flow.${viewName}.begin` event.
// THIS MUST BE MIXED IN *AFTER* views/mixins/flow-events-mixin.

define(function (require, exports, module) {
  'use strict';

  module.exports = {
    afterRender () {
      this.logFlowEventOnce('begin');
    }
  };
});
