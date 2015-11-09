/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The service-mixin is used in views that know about services, which is mostly
// OAuth services but also Sync.

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');

  module.exports = {
    transformLinks: function () {
      this.$('a[href~="/signin"]').attr('href',
          this.broker.transformLink('/signin'));
      this.$('a[href~="/signup"]').attr('href',
          this.broker.transformLink('/signup'));
    },

    // override this method so we can fix signup/signin links in errors
    displayErrorUnsafe: function (err) {
      var result = BaseView.prototype.displayErrorUnsafe.call(this, err);

      this.transformLinks();

      return result;
    }
  };
});
