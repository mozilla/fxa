/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var Devices = require('models/devices');
  var Notifier = require('lib/channels/notifier');

  describe('models/devices', function () {
    var devices;
    var notifier;

    beforeEach(function () {
      notifier = new Notifier();

      devices = new Devices([], {
        notifier: notifier
      });
    });

    describe('device list ordering', function () {
      beforeEach(function () {
        devices.set([
          {
            isCurrentDevice: false,
            name: 'zeta'
          },
          {
            isCurrentDevice: true,
            name: 'upsilon'
          },
          {
            isCurrentDevice: false,
            name: 'xi'
          },
          {
            isCurrentDevice: false,
            name: 'tau'
          },
          {
            isCurrentDevice: false,
            name: 'tau'
          },
          {
            isCurrentDevice: false,
            name: 'theta'
          }
        ]);
      });

      it('places the `current` device first', function () {
        assert.equal(devices.at(0).get('name'), 'upsilon');
      });

      it('sorts the rest alphabetically', function () {
        assert.equal(devices.at(1).get('name'), 'tau');
        assert.equal(devices.at(2).get('name'), 'tau');
        assert.equal(devices.at(3).get('name'), 'theta');
        assert.equal(devices.at(4).get('name'), 'xi');
        assert.equal(devices.at(5).get('name'), 'zeta');
      });
    });

    describe('device name change', function () {
      beforeEach(function () {
        devices.set([
          {
            id: 'device-1',
            isCurrentDevice: false,
            name: 'zeta'
          },
          {
            id: 'device-2',
            isCurrentDevice: true,
            name: 'upsilon'
          }
        ]);
      });
    });
  });
});

