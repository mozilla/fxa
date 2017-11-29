/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const { assert } = require('chai');
  const Backbone = require('backbone');
  const FormPrefill = require('models/form-prefill');
  const Notifier = require('lib/channels/notifier');
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
        assert.lengthOf(view.$('#age'), 1);
        assert.lengthOf(view.$('#fxa-tos'), 1);
        assert.lengthOf(view.$('#fxa-pp'), 1);
        assert.lengthOf(view.$('#marketing-email-optin'), 1);
        assert.isTrue(notifier.trigger.calledOnce);
        assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
      });
    });

    describe('validateAndSubmit', () => {
      beforeEach(() => {
        sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
        sinon.stub(view, 'tooYoung');
        sinon.spy(view, 'displayError');
      });

      describe('user is too young', () => {
        it('delegates to `tooYoung`', () => {
          view.$('#password').val('password');
          view.$('#age').val('11');

          return Promise.resolve(view.validateAndSubmit())
            .then(() => {
              assert.isTrue(view.tooYoung.calledOnce);
              assert.isFalse(view.signUp.calledOnce);
              assert.isFalse(view.displayError.called);
            });
        });
      });

      describe('user is old enough', () => {
        it('signs up the user', () => {
          view.$('#password').val('password');
          view.$('#age').val('21');

          sinon.stub(view, 'hasOptedInToMarketingEmail').callsFake(() => true);

          return Promise.resolve(view.validateAndSubmit())
            .then(() => {
              assert.isTrue(view.signUp.calledOnce);
              assert.isTrue(view.signUp.calledWith(account, 'password'));
              assert.isTrue(account.get('needsOptedInToMarketingEmail', true));

              assert.isFalse(view.displayError.called);
            });
        });
      });
    });
  });
});
