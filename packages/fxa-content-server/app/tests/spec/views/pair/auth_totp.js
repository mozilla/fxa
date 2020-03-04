/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import AuthorityBroker from 'models/auth_brokers/pairing/authority';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import Session from 'lib/session';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/pair/auth_totp';

const TOTP_CODE = '123123';
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

describe('views/pair/auth_totp', () => {
  let account;
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
    account = user.initAccount({ email: MOCK_EMAIL, uid: 'uid' });
    sinon.stub(account, 'accountProfile').callsFake(() => {
      return Promise.resolve(MOCK_ACCOUNT_PROFILE);
    });
    notifier = new Notifier();
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

  afterEach(function() {
    view.destroy();
  });

  function initView() {
    view = new View({
      broker,
      notifier,
      user,
      viewName: 'pairAuthTotp',
      window: windowMock,
      relier,
    });
    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
  }

  describe('render', () => {
    it('renders, can verify', () => {
      sinon.stub(view, 'invokeBrokerMethod').callsFake(() => {});
      sinon.spy(view, 'replaceCurrentPage');
      sinon
        .stub(account, 'verifyTotpCode')
        .callsFake(() => Promise.resolve({ success: true }));
      return view.render().then(() => {
        $('#container').html(view.el);
        view.$('.totp-code').val(TOTP_CODE);
        const serviceElText = view.$('.service').text();
        assert.include(serviceElText, 'Continue to');
        assert.notInclude(serviceElText, '%(serviceName)');
        return view.submit().then(() => {
          assert.isTrue(
            account.verifyTotpCode.calledWith(TOTP_CODE),
            'verify with correct code'
          );
        });
      });
    });

    it('handles errors', () => {
      sinon
        .stub(account, 'verifyTotpCode')
        .callsFake(() =>
          Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'))
        );
      sinon.spy(view, 'showValidationError');
      view.$('.totp-code').val(TOTP_CODE);
      return view
        .render()
        .then(() => {
          return view.submit();
        })
        .then(() => {
          assert.equal(
            view.showValidationError.args[0][1].errno,
            999,
            'correct error thrown'
          );
        });
    });
  });
});
