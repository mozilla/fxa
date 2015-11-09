/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var NavigateBehavior = require('views/behaviors/navigate');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('views/behaviors/navigate', function () {
    it('navigates to the indicated view, passing in success/error options', function () {
      var options = {
        error: 'error',
        success: 'success'
      };

      var navigateBehavior = new NavigateBehavior('settings', options);
      var viewMock = {
        navigate: sinon.spy()
      };

      var promise = navigateBehavior(viewMock);
      // navigateBehavior returns a promise that never resolves,
      // aborting the rest of the flow.
      assert.equal(promise.inspect().state, 'pending');

      var endpoint = viewMock.navigate.args[0][0];
      var navigateOptions = viewMock.navigate.args[0][1];

      assert.equal(endpoint, 'settings');
      assert.equal(navigateOptions.success, 'success');
      assert.equal(navigateOptions.error, 'error');
    });
  });
});
