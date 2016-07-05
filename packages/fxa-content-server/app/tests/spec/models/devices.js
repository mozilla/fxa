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
      var now = Date.now();

      beforeEach(function () {
        devices.set([
          {
            isCurrentDevice: false,
            lastAccessTime: null,
            name: 'xi'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: null,
            name: 'xi'
          },
          {
            isCurrentDevice: true,
            lastAccessTime: now - 20,
            name: 'zeta'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: now - 10,
            name: 'mu'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: now,
            name: 'tau'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: now,
            name: 'sigma'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: now - 20,
            name: 'theta'
          },
          {
            isCurrentDevice: false,
            lastAccessTime: null,
            name: 'upsilon'
          }
        ]);
      });

      it('places the `current` device first', function () {
        assert.equal(devices.at(0).get('name'), 'zeta');
      });

      it('sorts those with lastAccessTime next, by access time (descending)', function () {
        assert.equal(devices.at(1).get('name'), 'sigma');
        assert.equal(devices.at(2).get('name'), 'tau');
        assert.equal(devices.at(3).get('name'), 'mu');
        assert.equal(devices.at(4).get('name'), 'theta');

      });

      it('sorts the rest alphabetically', function () {
        assert.equal(devices.at(5).get('name'), 'upsilon');
        assert.equal(devices.at(6).get('name'), 'xi');
        assert.equal(devices.at(7).get('name'), 'xi');
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

