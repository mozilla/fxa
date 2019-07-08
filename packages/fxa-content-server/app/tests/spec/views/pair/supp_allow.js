/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import $ from 'jquery';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import { mockPairingChannel } from 'tests/mocks/pair';
import SupplicantBroker from 'models/auth_brokers/pairing/supplicant';
import View from 'views/pair/supp_allow';

const REMOTE_METADATA = {
  city: 'Toronto',
  country: 'Canada',
  deviceType: 'desktop',
  family: 'Firefox',
  ipAddress: '1.1.1.1',
  OS: 'Windows',
  region: 'Ontario',
  ua: 'Firefox 1.0',
};

describe('views/pair/supp_allow', () => {
  let config;
  let view;
  let notifier;
  let broker;
  let relier;

  beforeEach(() => {
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
      relier,
    });

    broker.set('remoteMetaData', REMOTE_METADATA);

    initView();
    sinon.stub(view, 'invokeBrokerMethod').callsFake(() => {});
    sinon.stub(view, 'replaceCurrentPage').callsFake(() => {});
  });

  afterEach(function() {
    view.destroy();
  });

  function initView() {
    view = new View({
      broker,
      viewName: 'pairSuppAllow',
    });
  }

  describe('render', () => {
    it('renders', () => {
      return view.render().then(() => {
        $('#container').html(view.el);
        assert.ok(view.$el.find('#supp-approve-btn').length);
        assert.equal(view.$el.find('.family-os').text(), 'Firefox on Windows');
        assert.equal(
          view.$el
            .find('.location')
            .text()
            .trim(),
          'Toronto, Ontario, Canada (estimated)'
        );
        assert.equal(
          view.$el.find('.ip-address').text(),
          'IP address: 1.1.1.1'
        );
        view.submit();
        assert.isTrue(
          view.invokeBrokerMethod.calledOnceWith('afterSupplicantApprove')
        );
        $('#container')
          .find('#cancel')
          .click();
        assert.isTrue(view.replaceCurrentPage.calledOnceWith('pair/failure'));
      });
    });
  });
});
