/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Function decorator to only allow one form submission.
 *
 * Requires the invokeHandler function.
 */

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');

  function allowOnlyOneSubmit(handler) {
    return function () {
      var self = this;
      var args = arguments;

      if (self._isSubmitting) {
        return p()
          .then(function () {
            // already submitting, get outta here.
            throw new Error('submit already in progress');
          });
      }

      self._isSubmitting = true;
      return p()
          .then(function () {
            return self.invokeHandler(handler, args);
          })
          .then(function (value) {
            self._isSubmitting = false;
            return value;
          }, function (err) {
            self._isSubmitting = false;
            throw err;
          });
    };
  }

  module.exports = allowOnlyOneSubmit;
});
