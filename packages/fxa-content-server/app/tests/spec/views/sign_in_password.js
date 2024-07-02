/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import { assert } from 'chai';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import FormPrefill from 'models/form-prefill';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import {
  SIGNIN_PASSWORD,
  THIRD_PARTY_AUTH,
} from '../../../../tests/functional/lib/selectors';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/sign_in_password';
import GleanMetrics from '../../../scripts/lib/glean';
import Glean from '@mozilla/glean/web';

const EMAIL = 'testuser@testuser.com';

const Selectors = { ...SIGNIN_PASSWORD, THIRD_PARTY_AUTH };

describe('views/sign_in_password', () => {
  let account;
  let broker;
  let formPrefill;
  let model;
  let notifier;
  let relier;
  let user;
  let view;

  beforeEach(() => {
    sinon.stub(GleanMetrics, 'setEnabled');
    sinon.stub(Glean, 'initialize');
    sinon.stub(Glean, 'setUploadEnabled');

    account = new Account({ email: EMAIL, metricsEnabled: false });
    broker = new Broker();
    formPrefill = new FormPrefill();
    model = new Backbone.Model({ account });
    notifier = new Notifier();
    sinon.spy(notifier, 'trigger');
    relier = new Relier({
      service: 'sync',
      serviceName: 'Firefox Sync',
    });
    user = new User();

    view = new View({
      broker,
      formPrefill,
      model,
      notifier,
      relier,
      user,
      viewName: 'signin/password',
    });

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;

    Glean.setUploadEnabled.restore();
    Glean.initialize.restore();
    GleanMetrics.setEnabled.restore();
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('redirects to `/` if no account', () => {
      sinon.stub(account, 'checkAccountStatus').callsFake(() =>
        Promise.resolve({
          exists: false,
        })
      );
      sinon.stub(view, 'getAccount').callsFake(() => null);
      view.beforeRender();

      assert.isTrue(view.navigate.calledOnceWith('/'));
    });

    it('does nothing if an account passed in', () => {
      sinon.stub(view, 'getAccount').callsFake(() => account);

      view.beforeRender();

      assert.isFalse(view.navigate.called);
    });

    it('disables Glean metrics on pref', () => {
      assert.isTrue(GleanMetrics.setEnabled.calledOnce);
      assert.equal(GleanMetrics.setEnabled.args[0][0], false);
    });

    describe('checkAccountStatus', () => {
      beforeEach(() => {
        sinon.stub(account, 'checkAccountStatus').callsFake(() =>
          Promise.resolve({
            exists: false,
          })
        );
      });
      it('calls if values are not set', () => {
        view.beforeRender();
        assert.isTrue(account.checkAccountStatus.calledOnce);
      });

      it('does not call if values exist', () => {
        sinon.stub(account, 'get').callsFake(() => true);
        view.beforeRender();
        assert.isFalse(account.checkAccountStatus.called);
      });
    });
  });

  describe('render', () => {
    it('renders as expected on sign-in screen', () => {
      sinon.stub(view, 'isPasswordNeededForAccount').callsFake(() => false);

      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), 'Sign in');
        assert.include(view.$(Selectors.SUB_HEADER).text(), 'Firefox Sync');
        assert.lengthOf(view.$('input[type=email]'), 1);
        assert.equal(view.$('input[type=email]').val(), EMAIL);
        assert.lengthOf(view.$('#tos-pp'), 1);
      });
    });

    it('renders as expected when password is required, initializes flow events', () => {
      assert.include(view.$(Selectors.HEADER).text(), 'Enter your password');
      assert.include(
        view.$(Selectors.SUB_HEADER_ENTER_PW).text(),
        'for your Mozilla account'
      );
      assert.lengthOf(view.$('input[type=email]'), 1);
      assert.equal(view.$('input[type=email]').val(), EMAIL);
      assert.lengthOf(view.$('input[type=password]'), 1);
      // assert.isTrue(notifier.trigger.calledOnce);
      assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
      assert.lengthOf(view.$('#tos-pp'), 1);
    });

    it('renders as expected when user has a linked account and no password', () => {
      account.set({
        hasLinkedAccount: true,
        hasPassword: false,
      });

      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), 'Sign in');
        assert.lengthOf(view.$('input[type=email]'), 0);
        assert.lengthOf(view.$('input[type=password]'), 0);

        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 1);
        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 1);

        assert.lengthOf(view.$('.separator'), 0);
        assert.lengthOf(view.$('#use-different'), 1);
        assert.lengthOf(view.$('#fxa-pp'), 1);
        assert.lengthOf(view.$('#fxa-tos'), 1);
        // only renders if service is pocket
        assert.lengthOf(view.$('#pocket-pp'), 0);
        assert.lengthOf(view.$('#pocket-tos'), 0);
        // only renders if service is monitor
        assert.lengthOf(view.$('#moz-subscription-tos'), 0);
        assert.lengthOf(view.$('#moz-subscription-privacy'), 0);
      });
    });

    it('renders as expected when user has a linked account and password', () => {
      account.set({
        hasLinkedAccount: true,
        hasPassword: true,
      });

      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), 'Enter your password');
        assert.lengthOf(view.$('input[type=password]'), 1);

        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 1);
        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 1);

        assert.lengthOf(view.$('.separator'), 1);
        assert.lengthOf(view.$('#use-different'), 1);
      });
    });

    it('renders as expected when user has a password', () => {
      account.set({
        hasLinkedAccount: false,
        hasPassword: true,
      });

      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), 'Enter your password');
        assert.lengthOf(view.$('input[type=password]'), 1);

        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 1);
        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 1);

        assert.lengthOf(view.$('.separator'), 1);
        assert.lengthOf(view.$('#use-different'), 1);
      });
    });

    it('renders as expected when user has a password (Sync)', () => {
      sinon.stub(relier, 'isSync').callsFake(() => true);

      account.set({
        hasLinkedAccount: false,
        hasPassword: true,
      });

      return view.render().then(() => {
        assert.include(view.$(Selectors.HEADER).text(), 'Enter your password');
        assert.lengthOf(view.$('input[type=password]'), 1);

        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 0);
        assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 0);
      });
    });

    it('renders TOS as expected when service is pocket', () => {
      relier.set({
        clientId: '749818d3f2e7857f',
      });
      // Pocket TOS should always show for pocket clients despite
      // linked account / password state
      account.set({
        hasLinkedAccount: true,
        hasPassword: false,
      });

      return view.render().then(() => {
        assert.lengthOf(view.$('#fxa-pp'), 1);
        assert.lengthOf(view.$('#fxa-tos'), 1);
        assert.lengthOf(view.$('#pocket-pp'), 1);
        assert.lengthOf(view.$('#pocket-tos'), 1);
        assert.lengthOf(view.$('#moz-subscription-tos'), 0);
        assert.lengthOf(view.$('#moz-subscription-privacy'), 0);
      });
    });

    it('renders TOS as expected when service is monitor', () => {
      relier.set({
        clientId: '802d56ef2a9af9fa',
      });
      // Monitor TOS should always show for monitor clients despite
      // linked account / password state
      account.set({
        hasLinkedAccount: true,
        hasPassword: false,
      });

      return view.render().then(() => {
        assert.lengthOf(view.$('#fxa-pp'), 1);
        assert.lengthOf(view.$('#fxa-tos'), 1);
        assert.lengthOf(view.$('#pocket-pp'), 0);
        assert.lengthOf(view.$('#pocket-tos'), 0);
        assert.lengthOf(view.$('#moz-subscription-tos'), 1);
        assert.lengthOf(view.$('#moz-subscription-privacy'), 1);
      });
    });
  });

  describe('validateAndSubmit', () => {
    let loginSubmitEventStub, cachedLoginSubmitEventStub;
    let loginSuccessStub;

    beforeEach(() => {
      sinon.stub(view, 'signIn').callsFake(() => {
        view.onSignInSuccess(account);
        return Promise.resolve();
      });
      loginSubmitEventStub = sinon.stub(GleanMetrics.login, 'submit');
      cachedLoginSubmitEventStub = sinon.stub(
        GleanMetrics.cachedLogin,
        'submit'
      );
      loginSuccessStub = sinon.stub(GleanMetrics.login, 'success');
    });

    afterEach(() => {
      loginSuccessStub.restore();
      loginSubmitEventStub.restore();
      cachedLoginSubmitEventStub.restore();
    });

    describe('password valid', () => {
      it('signs in the user', () => {
        sinon.stub(account, 'get').withArgs('verified').returns(true);
        view.$('#password').val('password');

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          assert.isTrue(view.signIn.calledOnce);
          assert.isTrue(view.signIn.calledWith(account, 'password'));
          sinon.assert.calledOnce(loginSuccessStub);
          sinon.assert.calledOnce(loginSubmitEventStub);
        });
      });
    });

    describe('password not needed', () => {
      it('signs in the user', () => {
        sinon.stub(view, 'getAccount').returns(account);
        // render's called in the top level beforeEach, so this gets around the
        // validation but test the submit.  we don't need a password input so
        // there's no need for input validation.
        sinon.stub(view, 'isValid').returns(true);
        sinon.stub(account, 'get').withArgs('hasPassword').returns(true);
        sinon.stub(view, 'isPasswordNeededForAccount').returns(false);
        sinon.stub(view, 'useLoggedInAccount').returns();

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          sinon.assert.calledOnce(view.isPasswordNeededForAccount);
          sinon.assert.calledWith(view.isPasswordNeededForAccount, account);
          sinon.assert.calledOnce(view.useLoggedInAccount);
          sinon.assert.calledWith(view.useLoggedInAccount, account);
          sinon.assert.calledOnce(cachedLoginSubmitEventStub);
          sinon.assert.notCalled(loginSubmitEventStub);
        });
      });
    });

    describe('useDifferentAccount', () => {
      let loginDiffAccountClickEventStub;

      beforeEach(() => {
        loginDiffAccountClickEventStub = sinon.stub(
          GleanMetrics.login,
          'diffAccountLinkClick'
        );
      });

      afterEach(() => {
        loginDiffAccountClickEventStub.restore();
      });

      it('navigates to `/` with the account', () => {
        sinon.spy(view, 'navigate');

        view.useDifferentAccount();

        sinon.assert.calledOnce(loginDiffAccountClickEventStub);
        assert.isTrue(view.navigate.calledOnceWith('/', { account }));
      });
    });
  });

  describe('onSignInError', () => {
    let loginSubmitErrorStub;

    beforeEach(() => {
      loginSubmitErrorStub = sinon.stub(GleanMetrics.login, 'error');
    });

    afterEach(() => {
      loginSubmitErrorStub.restore();
    });

    describe('metrics', () => {
      it('submits an "account locked" login_submit_frontend_error Glean ping', async () => {
        sinon
          .stub(view, 'signIn')
          .callsFake(() => Promise.reject(AuthErrors.ERRORS.ACCOUNT_RESET));
        view.$('#password').val('password');

        await Promise.resolve(view.validateAndSubmit()).then(() => {
          sinon.assert.calledOnce(loginSubmitErrorStub);
          sinon.assert.calledWithExactly(loginSubmitErrorStub, {
            reason: 'account locked',
          });
        });
      });

      it('submits a "password incorrect" login_submit_frontend_error Glean ping', () => {
        sinon
          .stub(view, 'signIn')
          .callsFake(() =>
            Promise.reject(AuthErrors.ERRORS.INCORRECT_PASSWORD)
          );
        view.$('#password').val('password');

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          sinon.assert.calledOnce(loginSubmitErrorStub);
          sinon.assert.calledWithExactly(loginSubmitErrorStub, {
            reason: 'password incorrect',
          });
        });
      });

      it('submits a "password missing" login_submit_frontend_error Glean ping', () => {
        sinon
          .stub(view, 'signIn')
          .callsFake(() =>
            Promise.reject(AuthErrors.ERRORS.UNABLE_TO_LOGIN_NO_PASSWORD_SET)
          );
        view.$('#password').val('password');

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          sinon.assert.calledOnce(loginSubmitErrorStub);
          sinon.assert.calledWithExactly(loginSubmitErrorStub, {
            reason: 'password missing',
          });
        });
      });
    });
  });

  describe('logView', () => {
    let loginViewEventStub, cachedLoginViewEventStub;

    beforeEach(() => {
      loginViewEventStub = sinon.stub(GleanMetrics.login, 'view');
      cachedLoginViewEventStub = sinon.stub(GleanMetrics.cachedLogin, 'view');
    });

    afterEach(() => {
      loginViewEventStub.restore();
      cachedLoginViewEventStub.restore();
    });

    it('submits a login_view Glean ping when a password is required', () => {
      view.logView();
      sinon.assert.calledOnce(loginViewEventStub);
    });

    it('submits a cached_login_view Glean ping when a password is not needed', () => {
      sinon.stub(view, 'getContext').returns({ isPasswordNeeded: false });
      view.logView();
      sinon.assert.calledOnce(cachedLoginViewEventStub);
      sinon.assert.notCalled(loginViewEventStub);
      view.getContext.restore();
    });
  });
});
