/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import SupplicantBroker from 'models/auth_brokers/pairing/supplicant';
import { mockPairingChannel } from 'tests/mocks/pair';
import { assert } from 'chai';

describe('models/auth_brokers/pairing/remote-metadata', function () {
  let broker;
  let config;
  let relier;
  let notifier;

  beforeEach(function () {
    config = {
      pairingChannelServerUri: 'ws://test',
      pairingClients: ['3c49430b43dfba77'],
    };
    relier = new Relier();
    relier.set({
      channelId: '1',
      channelKey: 'dGVzdA==',
      clientId: '3c49430b43dfba77',
      redirectUri: 'https://example.com?code=1&state=2',
    });
    notifier = new Notifier();

    broker = new SupplicantBroker({
      config,
      importPairingChannel: mockPairingChannel,
      notifier,
      relier: relier,
    });
  });

  describe('setRemoteMetaData', () => {
    it('sets setRemoteMetaData', () => {
      const UA =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:64.0) Gecko/20100101 Firefox/64.0';
      broker.setRemoteMetaData({
        ua: UA,
      });

      assert.deepEqual(broker.get('remoteMetaData'), {
        deviceType: 'desktop',
        family: 'Firefox',
        OS: 'macOS',
        ua: UA,
      });
    });
  });
});
