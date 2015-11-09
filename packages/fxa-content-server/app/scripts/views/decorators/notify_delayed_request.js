/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Function decorator to show a notice when requests take
 * longer than expected
 */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var p = require('lib/promise');

  function notifyDelayedRequest(handler) {
    return function () {
      var self = this;
      var args = arguments;
      var workingText;

      self.clearTimeout(self._workingTimeout);

      self._workingTimeout = self.setTimeout(function () {
        var err = AuthErrors.toError('WORKING');
        workingText = self.displayError(err);
      }, self.LONGER_THAN_EXPECTED);

      return p()
          .then(function () {
            return self.invokeHandler(handler, args);
          })
          .then(function (value) {
            self.clearTimeout(self._workingTimeout);
            if (workingText === self.$('.error').text()) {
              self.hideError();
            }
            return value;
          }, function (err) {
            self.clearTimeout(self._workingTimeout);
            throw err;
          });
    };
  }

  module.exports = notifyDelayedRequest;
});
