/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import FormPrefill from 'models/form-prefill';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import View from 'views/sign_up_password';
import WindowMock from '../../mocks/window';

const EMAIL = 'testuser@testuser.com';

describe('views/sign_up_password', () => {
  let account;
  let experimentGroupingRules;
  let formPrefill;
  let model;
  let notifier;
  let relier;
  let view;
  let windowMock;

  beforeEach(() => {
    account = new Account({ email: EMAIL });
    experimentGroupingRules = {
      choose: () => true
    };
    formPrefill = new FormPrefill();
    model = new Backbone.Model({ account });
    notifier = new Notifier();
    sinon.spy(notifier, 'trigger');

    relier = new Relier({
      service: 'sync',
      serviceName: 'Firefox Sync'
    });
    windowMock = new WindowMock();

    view = new View({
      experimentGroupingRules,
      formPrefill,
      model,
      notifier,
      relier,
      viewName: 'signup/password',
      window: windowMock
    });

    // Stub in he password strength balloon to avoid unexpected validation
    // errors during tests.
    sinon.stub(view, '_createPasswordWithStrengthBalloonView').callsFake(() => ({ on: sinon.spy() }));

    return view.render();
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('redirects to `/` if no account', () => {
      sinon.stub(view, 'getAccount').callsFake(() => null);

      view.beforeRender();

      assert.isTrue(view.navigate.calledOnce);
      assert.isTrue(view.navigate.calledWith('/'));
    });

    it('does nothing if an account passed in', () => {
      sinon.stub(view, 'getAccount').callsFake(() => account);

      view.beforeRender();

      assert.isFalse(view.navigate.called);
    });
  });

  describe('render', () => {
    it('renders as expected, initializes flow events', () => {
      assert.include(view.$('.service').text(), 'Firefox Sync');
      assert.lengthOf(view.$('input[type=email]'), 1);
      assert.equal(view.$('input[type=email]').val(), EMAIL);
      assert.lengthOf(view.$('#password'), 1);
      assert.lengthOf(view.$('#vpassword'), 1);
      assert.lengthOf(view.$('#age'), 1);
      assert.lengthOf(view.$('#fxa-tos'), 1);
      assert.lengthOf(view.$('#fxa-pp'), 1);
      assert.lengthOf(view.$('#marketing-email-optin'), 1);
      assert.isTrue(notifier.trigger.calledOnce);
      assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
    });
  });

  describe('autofocus behaviour', () => {
    it('focuses the password element if not pre-filled', () => {
      return view.render()
        .then(() => {
          assert.ok(view.$('input[type="password"]').attr('autofocus'));
        });
    });

    it('focuses the vpassword element if password is pre-filled', () => {
      formPrefill.set('password', 'password');
      return view.render()
        .then(() => {
          assert.ok(view.$('#vpassword').attr('autofocus'));
        });
    });

    it('focuses the age element if password and vpassword are both pre-filled', () => {
      formPrefill.set('password', 'password');
      formPrefill.set('vpassword', 'vpassword');
      return view.render()
        .then(() => {
          assert.ok(view.$('#age').attr('autofocus'));
        });
    });
  });

  describe('validateAndSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
      sinon.stub(view, 'tooYoung');
      sinon.spy(view, 'displayError');
    });

    describe('password and vpassword do not match', () => {
      it('displays an error', () => {
        view.$('#password').val('password123123');
        view.$('#vpassword').val('different_password');
        view.$('#age').val('21');

        return Promise.resolve(view.validateAndSubmit())
          .then(assert.fail, () => {
            assert.isFalse(view.signUp.called);
            assert.isTrue(view.displayError.calledOnce);
            const displayedError = view.displayError.args[0][0];
            assert.isTrue(AuthErrors.is(displayedError, 'PASSWORDS_DO_NOT_MATCH'));
          });
      });
    });

    describe('user is too young', () => {
      it('delegates to `tooYoung`', () => {
        view.$('#password').val('password123123');
        view.$('#vpassword').val('password123123');
        view.$('#age').val('11');

        return Promise.resolve(view.validateAndSubmit())
          .then(() => {
            assert.isTrue(view.tooYoung.calledOnce);
            assert.isFalse(view.signUp.called);
            assert.isFalse(view.displayError.called);
          });
      });
    });

    describe('user is old enough', () => {
      it('signs up the user', () => {
        view.$('#password').val('password123123');
        view.$('#vpassword').val('password123123');
        view.$('#age').val('21');

        sinon.stub(view, 'hasOptedInToMarketingEmail').callsFake(() => true);

        return Promise.resolve(view.validateAndSubmit())
          .then(() => {
            assert.isTrue(view.signUp.calledOnceWith(account, 'password123123'));
            assert.isTrue(account.get('needsOptedInToMarketingEmail', true));

            assert.isFalse(view.displayError.called);
          });
      });
    });
  });

  describe('useDifferentAccount', () => {
    it('navigates to `/` with the account', () => {
      sinon.spy(view, 'navigate');

      view.useDifferentAccount();

      assert.isTrue(view.navigate.calledOnceWith('/', { account }));
    });
  });
});
