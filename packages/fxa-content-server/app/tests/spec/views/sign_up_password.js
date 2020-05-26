/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import FormPrefill from 'models/form-prefill';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import { SIGNUP_PASSWORD } from '../../../../tests/functional/lib/selectors';
import View from 'views/sign_up_password';
import WindowMock from '../../mocks/window';

const Selectors = SIGNUP_PASSWORD;

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
  let broker;

  beforeEach(() => {
    account = new Account({ email: EMAIL });
    experimentGroupingRules = {
      choose: () => true,
    };
    formPrefill = new FormPrefill();
    model = new Backbone.Model({ account });
    notifier = new Notifier();
    sinon.spy(notifier, 'trigger');
    broker = new Broker();

    relier = new Relier({
      service: 'sync',
      serviceName: 'Firefox Sync',
    });
    windowMock = new WindowMock();
    broker = new Broker();

    view = new View({
      broker,
      experimentGroupingRules,
      formPrefill,
      model,
      notifier,
      relier,
      viewName: 'signup/password',
      window: windowMock,
    });

    // Stub in he password strength balloon to avoid unexpected validation
    // errors during tests.
    sinon
      .stub(view, '_createPasswordWithStrengthBalloonView')
      .callsFake(() => ({ on: sinon.spy() }));

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

      assert.isTrue(view.navigate.calledOnceWith('/'));
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
      assert.lengthOf(view.$(Selectors.EMAIL), 1);
      assert.equal(view.$(Selectors.EMAIL).val(), EMAIL);
      assert.lengthOf(view.$(Selectors.PASSWORD), 1);
      assert.lengthOf(view.$(Selectors.VPASSWORD), 1);
      assert.lengthOf(view.$(Selectors.AGE), 1);
      assert.lengthOf(view.$(Selectors.TOS), 1);
      assert.lengthOf(view.$(Selectors.PRIVACY_POLICY), 1);
      assert.lengthOf(view.$(Selectors.LINK_USE_DIFFERENT), 1);
      assert.lengthOf(view.$(Selectors.MARKETING_EMAIL_OPTIN), 3);
      assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);
      assert.lengthOf(view.$(Selectors.MARKETING_EMAIL_OPTIN), 3);
      assert.isTrue(notifier.trigger.calledOnce);
      assert.isTrue(notifier.trigger.calledWith('flow.initialize'));
    });

    it('does not display the link to change accounts if email forced', () => {
      model.set('forceEmail', EMAIL);

      return view.render().then(() => {
        assert.lengthOf(view.$(Selectors.LINK_USE_DIFFERENT), 0);
      });
    });

    it('handles the deleted account error', () => {
      model.set('error', AuthErrors.toError('DELETED_ACCOUNT'));
      return view.render().then(() => {
        view.afterVisible();
        assert.include(
          view.$(Selectors.ERROR).text().toLowerCase(),
          'recreate'
        );
      });
    });
  });

  describe('validateAndSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
      sinon.stub(view, 'tooYoung');
      sinon.spy(view, 'showValidationError');
    });

    describe('password and vpassword do not match', () => {
      it('displays an error', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('different_password');
        view.$(Selectors.AGE).val('21');

        return Promise.resolve(view.validateAndSubmit()).then(
          assert.fail,
          () => {
            assert.isFalse(view.signUp.called);
            assert.isTrue(view.showValidationError.calledOnce);
            const displayedError = view.showValidationError.args[0][1];
            assert.isTrue(
              AuthErrors.is(
                displayedError,
                AuthErrors.toError('PASSWORDS_DO_NOT_MATCH')
              )
            );
          }
        );
      });
    });

    describe('user is too young', () => {
      it('delegates to `tooYoung`', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('password123123');
        view.$(Selectors.AGE).val('11');

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          assert.isTrue(view.tooYoung.calledOnce);
          assert.isFalse(view.signUp.called);
          assert.isFalse(view.showValidationError.called);
        });
      });
    });

    describe('user is old enough', () => {
      it('signs up the user', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('password123123');
        view.$(Selectors.AGE).val('21');

        sinon.stub(view, 'isAnyNewsletterVisible').callsFake(() => true);
        sinon.stub(view, '_hasOptedIntoNewsletter').callsFake(() => true);

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          assert.isTrue(view.signUp.calledOnceWith(account, 'password123123'));
          assert.sameMembers(account.get('newsletters'), [
            'knowledge-is-power',
            'test-pilot',
            'take-action-for-the-internet',
          ]);

          assert.isFalse(view.showValidationError.called);
        });
      });
    });

    describe('marketing opt-in not visible', () => {
      it('does not set `hasOptedIntoNewsletter`', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('password123123');
        view.$(Selectors.AGE).val('21');

        sinon.stub(view, 'isAnyNewsletterVisible').callsFake(() => false);

        return Promise.resolve(view.validateAndSubmit()).then(() => {
          assert.isFalse(account.has('newsletters'));
        });
      });
    });
  });

  describe('_checkPasswordsMatch', () => {
    beforeEach(() => {
      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
      sinon.stub(view, 'tooYoung');
      sinon.spy(view, 'showValidationError');
    });

    describe('password and vpassword do not match', () => {
      it('displays an error', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('different_password');
        view.$(Selectors.AGE).val('21');

        return Promise.resolve(view._checkPasswordsMatch()).then(() => {
          assert.isTrue(view.showValidationError.calledOnce);
          const displayedError = view.showValidationError.args[0][1];
          assert.isTrue(
            AuthErrors.is(
              displayedError,
              AuthErrors.toError('PASSWORDS_DO_NOT_MATCH')
            )
          );
          assert.isFalse(
            view.showValidationError.args[0][2],
            'false to not focus element'
          );
        });
      });
    });

    describe('password and vpassword do match', () => {
      it('displays an error', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('password123123');
        view.$(Selectors.AGE).val('21');

        return Promise.resolve(view._checkPasswordsMatch()).then(() => {
          assert.isFalse(view.showValidationError.called);
        });
      });
    });
  });

  describe('inline confirm password validation', () => {
    beforeEach(() => {
      sinon.stub(view, 'signUp').callsFake(() => Promise.resolve());
      sinon.spy(view, 'showValidationError');
      sinon.spy(view, 'checkPasswordsMatchDebounce');
    });

    describe('check password and vpassword', () => {
      it('calls debounced password check', () => {
        view.$(Selectors.PASSWORD).val('password123123');
        view.$(Selectors.VPASSWORD).val('different_password');
        view.$(Selectors.AGE).val('21');

        return Promise.resolve(view.$(Selectors.VPASSWORD).keyup()).then(() => {
          assert.isFalse(view.signUp.called);
          assert.isTrue(view.checkPasswordsMatchDebounce.calledOnce);
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
