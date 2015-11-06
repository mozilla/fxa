/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var HaltBehavior = require('views/behaviors/halt');

  var assert = chai.assert;

  describe('views/behaviors/halt', function () {
    it('returns a promise that never resolves', function () {
      var haltBehavior = new HaltBehavior();
      var promise = haltBehavior({});
      assert.equal(promise.inspect().state, 'pending');
    });
  });
});
