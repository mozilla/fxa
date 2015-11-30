/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var Device = require('models/device');
  var sinon = require('sinon');

  describe('models/device', function () {
    var device;

    beforeEach(function () {
      device = new Device();
    });

    describe('destroy', function () {
      beforeEach(function () {
        sinon.spy(device, 'trigger');

        device.destroy();
      });

      it('triggers a `destroy` message', function () {
        assert.isTrue(device.trigger.calledWith('destroy'));
      });
    });
  });
});

