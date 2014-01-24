/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the router object for testing.

'use strict';

define([
  'underscore',
  'backbone'
], function (_, Backbone) {
  function RouterMock() {
    // nothing to do here.
  }

  _.extend(RouterMock.prototype, Backbone.Events, {
    navigate: function(page, opts) {
      this.page = page;
      this.opts = opts;

      this.trigger('navigate', page);
    }
  });

  return RouterMock;
});
