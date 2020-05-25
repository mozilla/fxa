/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AttachedClients from 'models/attached-clients';
import Constants from 'lib/constants';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import User from 'models/user';

describe('models/attached-clients', function () {
  var attachedClients;
  var notifier;
  var user;

  beforeEach(function () {
    notifier = new Notifier();
    user = new User();

    attachedClients = new AttachedClients([], {
      notifier: notifier,
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
      attachedClients.set(
        shuffle([
          {
            deviceId: 'device1',
            isCurrentSession: false,
            lastAccessTime: null,
            name: 'xi',
            sessionTokenId: 'session1',
          },
          {
            deviceId: 'device2',
            isCurrentSession: false,
            lastAccessTime: null,
            name: 'xi',
            sessionTokenId: 'session2',
          },
          {
            deviceId: 'device3',
            isCurrentSession: false,
            lastAccessTime: null,
            name: 'phi',
            sessionTokenId: 'session3',
          },
          {
            deviceId: 'device4',
            isCurrentSession: true,
            lastAccessTime: now - 20,
            name: 'zeta',
            sessionTokenId: 'session4',
          },
          {
            clientId: 'client1',
            isCurrentSession: false,
            lastAccessTime: now - 10,
            name: 'mu',
          },
          {
            deviceId: 'device5',
            isCurrentSession: false,
            lastAccessTime: now,
            name: 'tau',
            sessionTokenId: 'session5',
          },
          {
            deviceId: 'device6',
            isCurrentSession: false,
            lastAccessTime: now,
            name: 'sigma',
            sessionTokenId: 'session6',
          },
          {
            deviceId: 'device7',
            isCurrentSession: false,
            lastAccessTime: now - 20,
            name: 'theta',
            sessionTokenId: 'session7',
          },
          {
            clientId: 'client2',
            lastAccessTime: null,
            name: 'an oauth',
          },
          {
            lastAccessTime: now,
            name: 'a web session',
            sessionTokenId: 'session8',
          },
        ])
      );
    });

    it('places the `current` device first', function () {
      assert.equal(attachedClients.at(0).get('name'), 'zeta');
    });

    it('sorts those with lastAccessTime next, by access time (descending) grouped by clientType', function () {
      assert.equal(attachedClients.at(1).get('name'), 'sigma');
      assert.equal(attachedClients.at(2).get('name'), 'tau');
      assert.equal(attachedClients.at(3).get('name'), 'theta');
    });

    it('sorts the rest alphabetically grouped by clientType', function () {
      assert.equal(attachedClients.at(4).get('name'), 'phi');
      assert.equal(attachedClients.at(5).get('name'), 'xi');
      assert.equal(attachedClients.at(6).get('name'), 'xi');
      assert.equal(attachedClients.at(7).get('name'), 'mu');
      assert.equal(attachedClients.at(8).get('name'), 'an oauth');
      assert.equal(attachedClients.at(9).get('name'), 'a web session');
    });

    it('groups by clientType', () => {
      const types = attachedClients.map((cl) => cl.get('clientType'));
      assert.equal(types[0], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[1], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[2], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[3], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[4], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[5], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[6], Constants.CLIENT_TYPE_DEVICE);
      assert.equal(types[7], Constants.CLIENT_TYPE_OAUTH_APP);
      assert.equal(types[8], Constants.CLIENT_TYPE_OAUTH_APP);
      assert.equal(types[9], Constants.CLIENT_TYPE_WEB_SESSION);
    });
  });

  describe('device name change', function () {
    beforeEach(function () {
      attachedClients.set([
        {
          clientType: Constants.CLIENT_TYPE_DEVICE,
          id: 'device-1',
          isCurrentSession: false,
          name: 'zeta',
        },
        {
          clientType: Constants.CLIENT_TYPE_DEVICE,
          id: 'device-2',
          isCurrentSession: true,
          name: 'upsilon',
        },
      ]);
    });
  });

  describe('fetchClients', function () {
    beforeEach(function () {
      sinon.stub(user, 'fetchAccountAttachedClients').callsFake(function () {
        return Promise.resolve([
          {
            deviceId: 'device-1',
            isCurrentSession: true,
            name: 'zeta',
          },
          {
            clientId: 'oauth-1',
            name: 'oauthy',
          },
        ]);
      });
    });

    it('fetches the list of attached clients', function () {
      return attachedClients.fetchClients(user).then(() => {
        assert.equal(attachedClients.length, 2);
        assert.equal(attachedClients.at(0).get('clientType'), 'device');
        assert.equal(attachedClients.at(1).get('clientType'), 'oAuthApp');
      });
    });
  });
});
