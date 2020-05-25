/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthorityBroker from 'models/auth_brokers/pairing/authority';
import Session from 'lib/session';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/pair/auth_wait_for_supp';

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

describe('views/pair/auth_wait_for_supp', () => {
  let broker;
  let config;
  let relier;
  let user;
  let notifier;
  let view;
  let windowMock;

  beforeEach(() => {
    config = {
      pairingClients: ['3c49430b43dfba77'],
    };
    relier = new Relier();
    relier.set({
      clientId: '3c49430b43dfba77',
    });
    user = new User();
    notifier = new Notifier();
    broker = new AuthorityBroker({
      config,
      notifier,
      relier,
      session: Session,
      window: windowMock,
    });
    broker.set('remoteMetaData', REMOTE_METADATA);

    initView();
    sinon.spy(view, 'render');
    sinon.spy(view, 'displayError');
  });

  afterEach(function () {
    view.destroy();
  });

  function initView() {
    view = new View({
      broker,
      notifier,
      user,
      viewName: 'pairAuthComplete',
      window: windowMock,
    });
  }

  describe('initialize', () => {
    it('handles change', (done) => {
      view.initialize();
      view.model.trigger('change');
      setTimeout(() => {
        assert.isTrue(view.render.calledOnce);
        done();
      }, 1);
    });

    it('handles error', (done) => {
      view.initialize();
      view.broker.trigger('error');
      setTimeout(() => {
        assert.isTrue(view.displayError.calledOnce);
        done();
      }, 1);
    });
  });

  describe('render', () => {
    it('renders', () => {
      return view.render().then(() => {
        assert.equal(view.$el.find('.family-os').text(), 'Firefox on Windows');
        assert.equal(
          view.$el.find('.location').text().trim(),
          'Toronto, Ontario, Canada (estimated)'
        );
        assert.equal(
          view.$el.find('.ip-address').text(),
          'IP address: 1.1.1.1'
        );
      });
    });
  });
});
