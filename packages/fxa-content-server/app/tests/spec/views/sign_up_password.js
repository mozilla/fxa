/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const FormPrefill = require('models/form-prefill');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const View = require('views/sign_up_password');
  const WindowMock = require('../../mocks/window');

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
        sinon.stub(view, 'getAccount', () => null);

        view.beforeRender();

        assert.isTrue(view.navigate.calledOnce);
        assert.isTrue(view.navigate.calledWith('/'));
      });

      it('does nothing if an account passed in', () => {
        sinon.stub(view, 'getAccount', () => account);

        view.beforeRender();

        assert.isFalse(view.navigate.called);
      });
    });

    describe('render', () => {
      it('renders as expected', () => {
        assert.include(view.$('.service').text(), 'Firefox Sync');
        assert.lengthOf(view.$('input[type=email]'), 1);
        assert.equal(view.$('input[type=email]').val(), EMAIL);
        assert.lengthOf(view.$('#password'), 1);
        assert.lengthOf(view.$('#vpassword'), 1);
        assert.lengthOf(view.$('#age'), 1);
        assert.lengthOf(view.$('#fxa-tos'), 1);
        assert.lengthOf(view.$('#fxa-pp'), 1);
        assert.lengthOf(view.$('#marketing-email-optin'), 1);
      });
    });

    describe('validateAndSubmit', () => {
      beforeEach(() => {
        sinon.stub(view, 'signUp', () => p());
        sinon.stub(view, 'tooYoung');
        sinon.spy(view, 'displayError');
      });

      describe('passwords are different', () => {
        it('shows a `PASSWORDS_DO_NOT_MATCH` error', () => {
          view.$('#password').val('password');
          view.$('#vpassword').val('password2');
          view.$('#age').val('21');

          return p().then()
            .then(() => view.enableSubmitIfValid())
            .then(() => view.validateAndSubmit())
            .then(() => {
              assert.isFalse(view.signUp.calledOnce);
              assert.isTrue(view.displayError.calledOnce);
              const displayedError = view.displayError.args[0][0];
              assert.isTrue(AuthErrors.is(displayedError, 'PASSWORDS_DO_NOT_MATCH'));
            });
        });
      });

      describe('passwords are the same, user is too young', () => {
        it('delegates to `tooYoung`', () => {
          view.$('#password').val('password');
          view.$('#vpassword').val('password');
          view.$('#age').val('11');

          return p().then()
            .then(() => view.enableSubmitIfValid())
            .then(() => view.validateAndSubmit())
            .then(() => {
              assert.isTrue(view.tooYoung.calledOnce);
              assert.isFalse(view.signUp.calledOnce);
              assert.isFalse(view.displayError.called);
            });
        });
      });

      describe('passwords are the same, user is old enough', () => {
        it('signs up the user', () => {
          view.$('#password').val('password');
          view.$('#vpassword').val('password');
          view.$('#age').val('21');

          sinon.stub(view, 'hasOptedInToMarketingEmail', () => true);

          return p().then()
            .then(() => view.enableSubmitIfValid())
            .then(() => view.validateAndSubmit())
            .then(() => {
              assert.isTrue(view.signUp.calledOnce);
              assert.isTrue(view.signUp.calledWith(account, 'password'));
              assert.isTrue(account.get('needsOptedInToMarketingEmail', true));

              assert.isFalse(view.displayError.called);
            });
        });
      });
    });

    describe('click on the email field', () => {
      it('navigates back', () => {
        $('#container').html(view.el);

        sinon.spy(view, 'back');
        view.$('input[type=email]').click();
        assert.isTrue(view.back.calledOnce);
      });
    });
  });
});
