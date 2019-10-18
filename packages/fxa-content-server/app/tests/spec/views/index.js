/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthBroker from 'models/auth_brokers/base';
import AuthErrors from 'lib/auth-errors';
import { ENTER_EMAIL } from '../../../../tests/functional/lib/selectors';
import FormPrefill from 'models/form-prefill';
import IndexView from 'views/index';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../mocks/window';

const Selectors = ENTER_EMAIL;

const EMAIL = 'testuser@testuser.com';

describe('views/index', () => {
  let broker;
  let formPrefill;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    broker = new AuthBroker();
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    relier = new Relier();
    windowMock = new WindowMock();

    user = new User();

    view = new IndexView({
      broker,
      formPrefill,
      notifier,
      relier,
      user,
      window: windowMock,
    });

    $('body').attr(
      'data-flow-id',
      'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
    );
    $('body').attr('data-flow-begin', '42');
  });

  afterEach(() => {
    view.remove();
    view.destroy();

    view = null;
  });

  it('viewName is `enter-email`', () => {
    assert.equal(view.viewName, 'enter-email');
  });

  describe('render', () => {
    beforeEach(() => {
      sinon.spy(notifier, 'trigger');
      sinon.spy(view, 'navigate');
      sinon.spy(view, 'replaceCurrentPage');
    });

    describe('account has bounced', () => {
      it('prefills the email, shows a tooltip', () => {
        const bouncedAccount = user.initAccount({
          email: 'bounced@bounced.com',
          hasBounced: true,
          sessionToken: 'token',
        });
        sinon.stub(view, 'getAccount').callsFake(() => bouncedAccount);
        sinon.spy(view, 'showValidationError');

        return view.render().then(() => {
          view.afterVisible();

          assert.isTrue(view.showValidationError.called);
          const err = view.showValidationError.args[0][1];
          assert.isTrue(AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE'));
        });
      });
    });

    describe('user is too young', () => {
      it('redirects to `/cannot_create_account`', () => {
        windowMock.document.cookie = 'tooyoung; 1';

        return view.render().then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('cannot_create_account'));
          assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
        });
      });
    });

    describe('current account', () => {
      it('replaces current page with to `/settings`', () => {
        const signedInAccount = user.initAccount({
          sessionToken: 'token',
        });
        sinon.stub(user, 'getSignedInAccount').callsFake(() => signedInAccount);
        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnce);
          assert.isTrue(view.replaceCurrentPage.calledWith('settings'));
          assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
        });
      });
    });

    describe('no current account', () => {
      describe('relier.action set, !== email', () => {
        it('replaces current page with page specified by `action`', () => {
          relier.set('action', 'signin');
          return view.render().then(() => {
            assert.isTrue(view.replaceCurrentPage.calledOnce);
            assert.isTrue(view.replaceCurrentPage.calledWith('signin'));
            assert.isFalse(notifier.trigger.calledWith('email-first-flow'));
          });
        });
      });

      describe('broker disables legacy signin/signup', () => {
        it('renders as expected, starts the flow metrics', () => {
          broker.setCapability('disableLegacySigninSignup', true);

          relier.set({
            service: 'sync',
            serviceName: 'Firefox Sync',
          });

          sinon
            .stub(view, 'isInEmailFirstExperimentGroup')
            .callsFake(() => false);

          return renderTestEnterEmailDisplayed(view);
        });
      });

      describe('relier.action === email', () => {
        it('renders as expected, starts the flow metrics', () => {
          relier.set({
            action: 'email',
            service: 'sync',
            serviceName: 'Firefox Sync',
          });

          sinon
            .stub(view, 'isInEmailFirstExperimentGroup')
            .callsFake(() => false);

          return renderTestEnterEmailDisplayed(view);
        });

        it('handles relier specified emails', () => {
          relier.set({
            action: 'email',
            email: 'testuser@testuser.com',
            service: 'sync',
            serviceName: 'Firefox Sync',
          });

          sinon
            .stub(view, 'isInEmailFirstExperimentGroup')
            .callsFake(() => false);
          sinon.stub(view, 'checkEmail').callsFake(() => Promise.resolve());

          return view.render().then(() => {
            assert.isTrue(
              view.checkEmail.calledOnceWith('testuser@testuser.com')
            );
          });
        });

        it('renders the firefox-family services', () => {
          return view.render().then(() => {
            assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);
          });
        });
      });

      describe('user is in EmailFirstExperiment `treatment` group', () => {
        it('renders as expected, starts the flow metrics', () => {
          relier.set({
            service: 'sync',
            serviceName: 'Firefox Sync',
          });

          sinon
            .stub(view, 'isInEmailFirstExperimentGroup')
            .callsFake(() => true);

          return renderTestEnterEmailDisplayed(view);
        });
      });

      describe('user is not in EmailFirstExperiment `treatment` group', () => {
        it('redirects to `/signup`', () => {
          sinon
            .stub(view, 'isInEmailFirstExperimentGroup')
            .callsFake(() => false);

          return view.render().then(() => {
            assert.isTrue(view.isInEmailFirstExperimentGroup.calledOnce);
            assert.isTrue(
              view.isInEmailFirstExperimentGroup.calledWith('treatment')
            );

            assert.isTrue(view.replaceCurrentPage.calledOnce);
            assert.isTrue(view.replaceCurrentPage.calledWith('signup'));
          });
        });
      });
    });
  });

  describe('showValidationErrorsEnd', () => {
    beforeEach(() => {
      relier.set('action', 'email');
      sinon.spy(view, 'showValidationError');

      return view.render();
    });

    it('shows an error if the user re-enters bounced email', () => {
      sinon.stub(view, '_isEmailSameAsBouncedEmail').callsFake(() => true);

      view.showValidationErrorsEnd();
      assert.isTrue(
        view.showValidationError.calledOnceWith('input[type=email]')
      );

      assert.isTrue(
        AuthErrors.is(
          view.showValidationError.args[0][1],
          'DIFFERENT_EMAIL_REQUIRED'
        )
      );
    });

    it('shows an error if the user provides a @firefox.com email', () => {
      view.$(Selectors.EMAIL).val('firefox@firefox.com');
      view.showValidationErrorsEnd();
      assert.isTrue(view.showValidationError.calledOnce);

      assert.equal(view.showValidationError.args[0][0], Selectors.EMAIL);
      assert.isTrue(
        AuthErrors.is(
          view.showValidationError.args[0][1],
          'DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'
        )
      );
    });

    it('shows an error if the user provides a @firefox email', () => {
      view.$(Selectors.EMAIL).val('firefox@firefox');
      view.showValidationErrorsEnd();
      assert.isTrue(view.showValidationError.calledOnce);

      assert.equal(view.showValidationError.args[0][0], Selectors.EMAIL);
      assert.isTrue(
        AuthErrors.is(
          view.showValidationError.args[0][1],
          'DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'
        )
      );
    });

    it('does not show an error if firefox.com is in the local side of the email address', () => {
      view.$(Selectors.EMAIL).val('firefox.com@testuser.com');
      view.showValidationErrorsEnd();
      assert.equal(view.showValidationError.callCount, 0);
    });

    it('does not show an error if the user provides non @firefox.com email', () => {
      view.$(Selectors.EMAIL).val('another@testuser.com');
      view.showValidationErrorsEnd();
      assert.equal(view.showValidationError.callCount, 0);
    });
  });

  describe('submit', () => {
    it('checks the entered email', () => {
      sinon.stub(view, 'checkEmail').callsFake(() => Promise.resolve());

      return view
        .render()
        .then(() => {
          view.$(Selectors.EMAIL).val(EMAIL);
        })
        .then(() => view.submit())
        .then(() => {
          assert.isTrue(view.checkEmail.calledOnce);
          assert.isTrue(view.checkEmail.calledWith(EMAIL));
        });
    });
  });

  describe('checkEmail', () => {
    beforeEach(() => {
      relier.set('action', 'email');
      sinon.stub(view, 'navigate').callsFake(() => {});
      sinon.stub(broker, 'beforeSignIn').callsFake(() => Promise.resolve());
      sinon.stub(view, 'afterRender').callsFake(() => Promise.resolve());

      return view.render();
    });

    describe('email is registered', () => {
      it('navigates to signin using the stored account so that profile images can be displayed', () => {
        const storedAccount = user.initAccount({});

        sinon
          .stub(user, 'checkAccountEmailExists')
          .callsFake(() => Promise.resolve(true));
        sinon.stub(user, 'getAccountByEmail').callsFake(() => storedAccount);

        return view.checkEmail(EMAIL).then(() => {
          assert.isTrue(broker.beforeSignIn.calledOnce);
          const brokerAccount = broker.beforeSignIn.args[0][0];
          assert.equal(brokerAccount.get('email'), EMAIL);

          assert.isTrue(view.navigate.calledOnceWith('signin'));
          const { account } = view.navigate.args[0][1];
          assert.strictEqual(account, storedAccount);
          // Ensure the email is added to the stored account.
          assert.equal(account.get('email'), EMAIL);
        });
      });
    });

    describe('email is not registered', () => {
      it('navigates to signup', () => {
        sinon
          .stub(user, 'checkAccountEmailExists')
          .callsFake(() => Promise.resolve(false));
        return view.checkEmail(EMAIL).then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('signup'));
          const { account } = view.navigate.args[0][1];
          assert.equal(account.get('email'), EMAIL);

          assert.isTrue(broker.beforeSignIn.calledOnce);
          assert.isTrue(broker.beforeSignIn.calledWith(account));
        });
      });
    });
  });

  function renderTestEnterEmailDisplayed(view) {
    sinon.spy(view, 'logFlowEventOnce');

    return view.render().then(() => {
      assert.isFalse(view.replaceCurrentPage.called);

      assert.lengthOf(view.$(Selectors.HEADER), 1);
      assert.lengthOf(view.$(Selectors.EMAIL), 1);
      assert.include(view.$(Selectors.SUB_HEADER).text(), 'Firefox Sync');
      assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);

      assert.isTrue(notifier.trigger.calledWith('email-first-flow'));

      assert.isTrue(view.logFlowEventOnce.calledOnce);
      assert.isTrue(view.logFlowEventOnce.calledWith('begin'));
    });
  }
});
