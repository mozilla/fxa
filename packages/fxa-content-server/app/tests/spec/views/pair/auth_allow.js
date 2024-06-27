/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Backbone from 'backbone';
import { assert } from 'chai';
import $ from 'jquery';
import Notifier from 'lib/channels/notifier';
import Session from 'lib/session';
import AuthorityBroker from 'models/auth_brokers/pairing/authority';
import Relier from 'models/reliers/relier';
import User from 'models/user';
import sinon from 'sinon';
import View from 'views/pair/auth_allow';
import GleanMetrics from '../../../../scripts/lib/glean';

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
const MOCK_EMAIL = 'TESTUSER@testuser.com';
const MOCK_ACCOUNT_PROFILE = {
  authenticationMethods: ['pwd', 'email'],
  authenticatorAssuranceLevel: 1,
  email: MOCK_EMAIL,
};

describe('views/pair/auth_allow', () => {
  let account;
  let broker;
  let config;
  let relier;
  let model;
  let user;
  let notifier;
  let view;
  let windowMock;

  beforeEach(() => {
    model = new Backbone.Model();
    config = {
      pairingClients: ['3c49430b43dfba77'],
    };
    relier = new Relier();
    relier.set({
      clientId: '3c49430b43dfba77',
    });
    user = new User();
    account = user.initAccount({ email: MOCK_EMAIL, uid: 'uid' });
    sinon.stub(account, 'accountProfile').callsFake(() => {
      return Promise.resolve(MOCK_ACCOUNT_PROFILE);
    });
    notifier = new Notifier();

    model.set({
      account: account,
    });
    broker = new AuthorityBroker({
      config,
      notifier,
      relier,
      session: Session,
      window: windowMock,
    });
    broker.set('remoteMetaData', REMOTE_METADATA);
    broker.set('browserSignedInAccount', {
      email: account.get('email'),
    });

    initView();
  });

  afterEach(function () {
    view.destroy();
  });

  function initView() {
    view = new View({
      broker,
      model,
      notifier,
      user,
      viewName: 'pairAuthAllow',
      window: windowMock,
    });
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
  }

  describe('render', () => {
    const HEADER_TEXT = 'Did you just sign in to Firefox?';
    it('renders and can submit', () => {
      sinon.stub(view, 'invokeBrokerMethod').callsFake(() => {});
      sinon.spy(view, 'replaceCurrentPage');
      return view.render().then(() => {
        $('#container').html(view.el);
        assert.isTrue(
          view.$el
            .find('#fxa-pair-auth-allow-header')
            .text()
            .includes(HEADER_TEXT)
        );
        assert.isTrue(view.$el.find('header p').text().includes(MOCK_EMAIL));
        assert.equal(view.$el.find('#family-os').text(), 'Firefox on Windows');
        assert.equal(
          view.$el.find('#location').text().trim(),
          'Toronto, Ontario, Canada (estimated)'
        );
        assert.equal(
          view.$el.find('#ip-address').text(),
          'IP address: 1.1.1.1'
        );
        view.submit();
        assert.isTrue(
          view.invokeBrokerMethod.calledOnceWith('afterPairAuthAllow')
        );
        assert.isFalse(
          view.invokeBrokerMethod.calledOnceWith('afterPairAuthDecline')
        );
        assert.lengthOf(view.$('#change-password'), 1);
      });
    });

    it('can change password', async () => {
      sinon.spy(view, 'navigateAway');

      await view.render();

      view.$('#change-password').click();

      assert.isTrue(
        view.navigateAway.calledOnceWith('/settings/change_password')
      );
    });

    it('handles errors', (done) => {
      sinon.spy(view, 'displayError');
      view.initialize();
      view.render().then(() => {
        broker.trigger('error', new Error('boom'));
        setTimeout(() => {
          assert.isTrue(view.displayError.calledOnce);
          done();
        }, 1);
      });
    });

    it('handles users with TOTP', () => {
      account.accountProfile.restore();
      sinon.stub(account, 'accountProfile').callsFake(() => {
        return Promise.resolve({
          authenticationMethods: ['pwd', 'email', 'otp'],
          authenticatorAssuranceLevel: 1,
          email: MOCK_EMAIL,
        });
      });
      sinon.spy(view, 'replaceCurrentPage');
      return view.render().then(() => {
        assert.isTrue(view.replaceCurrentPage.calledOnceWith('pair/auth/totp'));
      });
    });

    it('handles users after TOTP with existing token', () => {
      model.set('totpComplete', true);

      account.accountProfile.restore();
      sinon.stub(account, 'accountProfile').callsFake(() => {
        return Promise.resolve({
          authenticationMethods: ['pwd', 'email', 'otp'],
          authenticatorAssuranceLevel: 1,
          email: MOCK_EMAIL,
        });
      });
      sinon.spy(view, 'replaceCurrentPage');
      return view.render().then(() => {
        $('#container').html(view.el);
        assert.isFalse(
          view.replaceCurrentPage.calledOnceWith('pair/auth/totp')
        );
        assert.isTrue(
          view.$el
            .find('#fxa-pair-auth-allow-header')
            .text()
            .includes(HEADER_TEXT)
        );
        assert.equal(view.$el.find('#family-os').text(), 'Firefox on Windows');
        assert.equal(
          view.$el.find('#location').text().trim(),
          'Toronto, Ontario, Canada (estimated)'
        );
        assert.equal(
          view.$el.find('#ip-address').text(),
          'IP address: 1.1.1.1'
        );
      });
    });

    describe('glean metrics', () => {
      let viewEventStub;
      let submitEventStub;

      beforeEach(() => {
        sinon.stub(view, 'invokeBrokerMethod').callsFake(() => {});
        viewEventStub = sinon.stub(GleanMetrics.cadApproveDevice, 'view');
        submitEventStub = sinon.stub(GleanMetrics.cadApproveDevice, 'submit');
      });

      afterEach(() => {
        viewEventStub.restore();
        submitEventStub.restore();
      });

      it('logs a view Glean metrics event', () => {
        view.logView();
        sinon.assert.calledOnce(viewEventStub);
      });

      it('logs a submit Glean metrics event', () => {
        view.submit();
        sinon.assert.calledOnce(submitEventStub);
      });
    });
  });
});
