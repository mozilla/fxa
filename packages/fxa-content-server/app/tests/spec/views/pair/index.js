/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import View from 'views/pair/index';
import BaseBroker from 'models/auth_brokers/base';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import User from 'models/user';
import WindowMock from '../../../mocks/window';

const UA_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36';
const UA_FIREFOX =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0';

describe('views/pair/index', () => {
  let account;
  let user;
  let view;
  let broker;
  let notifier;
  let relier;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    notifier = new Notifier();
    relier = new Relier(
      {},
      {
        window: windowMock,
      }
    );
    user = new User();
    account = user.initAccount();
    sinon.stub(account, 'accountProfile').callsFake(() => {
      return Promise.resolve({
        authenticationMethods: ['pwd', 'email'],
        authenticatorAssuranceLevel: 1,
        email: 'a@a.com',
      });
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    view = new View({
      broker,
      notifier,
      relier,
      viewName: 'pairIndex',
      window: windowMock,
    });
    sinon.stub(view, 'navigate');
    sinon.spy(view, 'replaceCurrentPage');
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
  });

  afterEach(function() {
    view.destroy();
  });

  describe('render', () => {
    it('redirects to unsupported for non-Firefox desktop', () => {
      windowMock.navigator.userAgent = UA_CHROME;

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to unsupported for Firefox desktop but capability turned off', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.setCapability('supportsPairing', false);

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to unsupported if no capability', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.unsetCapability('supportsPairing');

      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
      });
      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
      });
    });

    it('redirects to CAD if not signed in', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      broker.setCapability('supportsPairing', true);

      return view.render().then(() => {
        assert.isTrue(
          view.replaceCurrentPage.calledOnceWith('connect_another_device')
        );
      });
    });

    it('shows the code button', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
        verified: true,
      });
      broker.setCapability('supportsPairing', true);

      return view.render().then(() => {
        assert.isFalse(
          view.replaceCurrentPage.calledOnceWith('pair/unsupported')
        );
        assert.ok(
          view.$el.find('#pair-header').text(),
          'Connect another device'
        );
        assert.ok(view.$el.find('#start-pairing').length);
        assert.ok(view.$el.find('.graphic').length);
      });
    });

    it('navigates away to sync signin for unverified accounts', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        sessionToken: 'abc123',
        uid: 'uid',
        verified: false,
      });
      broker.setCapability('supportsPairing', true);
      sinon.stub(view, 'navigateAway').callsFake(() => {});

      return view.render().then(() => {
        assert.isTrue(view.navigateAway.calledOnce);
      });
    });

    it('navigates away to sync signin for accounts with no sessionToken', () => {
      windowMock.navigator.userAgent = UA_FIREFOX;
      account.set({
        email: 'testuser@testuser.com',
        uid: 'uid',
        verified: true,
      });
      broker.setCapability('supportsPairing', true);
      sinon.stub(view, 'navigateAway').callsFake(() => {});

      return view.render().then(() => {
        assert.isTrue(view.navigateAway.calledOnce);
      });
    });
  });

  describe('submit', () => {
    it('submits', () => {
      sinon.spy(view.broker, 'openPairPreferences');
      return view.render().then(() => {
        view.submit();
        assert.isTrue(view.broker.openPairPreferences.calledOnce);
      });
    });
  });
});
