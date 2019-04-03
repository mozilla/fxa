/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;
const Device = require('models/device');
const sinon = require('sinon');

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
