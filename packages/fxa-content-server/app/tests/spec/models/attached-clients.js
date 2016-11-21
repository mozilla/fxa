/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const assert = require('chai').assert;
  const AttachedClients = require('models/attached-clients');
  const Constants = require('lib/constants');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const User = require('models/user');

  describe('models/attached-clients', function () {
    var attachedClients;
    var notifier;
    var user;

    beforeEach(function () {
      notifier = new Notifier();
      user = new User();

      attachedClients = new AttachedClients([], {
        notifier: notifier
      });
    });

    function shuffle(items) {
      for (var i = items.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
      }
      return items;
    }

    describe('properly orders the attached clients', function () {
      var now = Date.now();

      beforeEach(function () {
        // We input the list of clients in a random order,
        // so that the tests won't accidentally depend on implementation
        // details of how the underlying sort algorithm works.
        attachedClients.set(shuffle([
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: false,
            lastAccessTime: null,
            name: 'xi'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: false,
            lastAccessTime: null,
            name: 'xi'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: true,
            lastAccessTime: now - 20,
            name: 'zeta'
          },
          {
            clientType: Constants.CLIENT_TYPE_OAUTH_APP,
            isCurrentDevice: false,
            lastAccessTime: now - 10,
            name: 'mu'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: false,
            lastAccessTime: now,
            name: 'tau'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: false,
            lastAccessTime: now,
            name: 'sigma'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            isCurrentDevice: false,
            lastAccessTime: now - 20,
            name: 'theta'
          },
          {
            clientType: Constants.CLIENT_TYPE_OAUTH_APP,
            lastAccessTime: null,
            name: 'an oauth'
          }
        ]));
      });

      it('places the `current` device first', function () {
        assert.equal(attachedClients.at(0).get('name'), 'zeta');
      });

      it('sorts those with lastAccessTime next, by access time (descending)', function () {
        assert.equal(attachedClients.at(1).get('name'), 'sigma');
        assert.equal(attachedClients.at(2).get('name'), 'tau');
        assert.equal(attachedClients.at(3).get('name'), 'mu');
        assert.equal(attachedClients.at(4).get('name'), 'theta');

      });

      it('sorts the rest alphabetically', function () {
        assert.equal(attachedClients.at(5).get('name'), 'an oauth');
        assert.equal(attachedClients.at(6).get('name'), 'xi');
        assert.equal(attachedClients.at(7).get('name'), 'xi');
      });
    });

    describe('device name change', function () {
      beforeEach(function () {
        attachedClients.set([
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            id: 'device-1',
            isCurrentDevice: false,
            name: 'zeta'
          },
          {
            clientType: Constants.CLIENT_TYPE_DEVICE,
            id: 'device-2',
            isCurrentDevice: true,
            name: 'upsilon'
          }
        ]);
      });
    });

    describe('fetchClients', function () {
      beforeEach(function () {
        sinon.stub(user, 'fetchAccountDevices', function () {
          return p([{
            clientType: Constants.CLIENT_TYPE_DEVICE,
            id: 'device-1',
            isCurrentDevice: true,
            name: 'zeta'
          }]);
        });

        sinon.stub(user, 'fetchAccountOAuthApps', function () {
          return p([{
            clientType: Constants.CLIENT_TYPE_OAUTH_APP,
            id: 'oauth-1',
            name: 'oauthy'
          }]);
        });
      });

      it('fetches both types of clients', function () {
        return attachedClients.fetchClients({devices: true, oAuthApps: true}, user)
          .then(() => {
            assert.equal(attachedClients.length, 2);
            assert.equal(attachedClients.at(0).get('clientType'), 'device');
            assert.equal(attachedClients.at(1).get('clientType'), 'oAuthApp');
          });
      });

      it('fetches just devices', function () {
        return attachedClients.fetchClients({devices: true}, user)
          .then(() => {
            assert.equal(attachedClients.length, 1);
            assert.equal(attachedClients.at(0).get('clientType'), 'device');
          });
      });

      it('fetches just oAuthApps', function () {
        return attachedClients.fetchClients({oAuthApps: true}, user)
          .then(() => {
            assert.equal(attachedClients.length, 1);
            assert.equal(attachedClients.at(0).get('clientType'), 'oAuthApp');
          });
      });

      it('fetches nothing', function () {
        return attachedClients.fetchClients({}, user)
          .then(() => {
            assert.equal(attachedClients.length, 0);
          });
      });
    });
  });
});

