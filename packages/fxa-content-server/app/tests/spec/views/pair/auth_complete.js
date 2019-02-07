/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {assert} from 'chai';
import AuthorityBroker from 'models/auth_brokers/pairing/authority';
import Session from 'lib/session';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/pair/auth_complete';

const REMOTE_METADATA = {
  OS: 'Windows',
  city: 'Toronto',
  country: 'Canada',
  deviceType: 'desktop',
  family: 'Firefox',
  ipAddress: '1.1.1.1',
  region: 'Ontario',
  ua: 'Firefox 1.0',
};

describe('views/pair/auth_complete', () => {
  let broker;
  let relier;
  let user;
  let notifier;
  let view;
  let windowMock;

  beforeEach(() => {
    user = new User();
    notifier = new Notifier();
    broker = new AuthorityBroker({
      notifier,
      relier,
      session: Session,
      window: windowMock,
    });
    broker.set('remoteMetaData', REMOTE_METADATA);

    initView();
    sinon.stub(view, 'invokeBrokerMethod').callsFake(() => {});
  });

  afterEach(function () {
    view.destroy();
  });

  function initView () {
    view = new View({
      broker,
      notifier,
      user,
      viewName: 'pairAuthComplete',
      window: windowMock
    });
  }

  describe('beforeRender', () => {
    it('invokes the broker', () => {
      return view.render().then(() => {
        assert.isTrue(view.invokeBrokerMethod.calledOnceWith('afterPairAuthComplete'));
      });
    });
  });

  describe('render', () => {
    it('renders', () => {
      return view.render().then(() => {
        assert.equal(view.$el.find('#pair-auth-complete-header').text(), 'Device connected');
        assert.equal(view.$el.find('.family-os').text(), 'Firefox on Windows');
        assert.equal(view.$el.find('.location').text().trim(), 'Toronto, Ontario, Canada (estimated)');
        assert.equal(view.$el.find('.ip-address').text(), 'IP address: 1.1.1.1');
        assert.ok(view.$el.find('.graphic-connect-another-device-hearts').length);
      });
    });
  });
});
