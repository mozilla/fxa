/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const NavigateBehavior = require('views/behaviors/navigate');
  const sinon = require('sinon');

  describe('views/behaviors/navigate', function () {
    it('navigates to the indicated view, passing in success/error options', function () {
      const options = {
        error: 'error',
        success: 'success'
      };

      const navigateBehavior = new NavigateBehavior('settings', options);
      const viewMock = {
        navigate: sinon.spy()
      };

      const accountMock = {};

      const promise = navigateBehavior(viewMock, accountMock);
      // navigateBehavior returns a promise that never resolves,
      // aborting the rest of the flow.
      assert.isFunction(promise.then);

      const endpoint = viewMock.navigate.args[0][0];
      const navigateOptions = viewMock.navigate.args[0][1];

      assert.equal(endpoint, 'settings');
      assert.equal(navigateOptions.success, 'success');
      assert.equal(navigateOptions.error, 'error');
      assert.strictEqual(navigateOptions.account, accountMock);
    });
  });
});
