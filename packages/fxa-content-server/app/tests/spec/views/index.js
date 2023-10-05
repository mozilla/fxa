/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthBroker from 'models/auth_brokers/base';
import AuthErrors from 'lib/auth-errors';
import {
  ENTER_EMAIL,
  THIRD_PARTY_AUTH,
} from '../../../../tests/functional/lib/selectors';
import FormPrefill from 'models/form-prefill';
import IndexView from 'views/index';
import GleanMetrics from '../../../scripts/lib/glean';
import { Model } from 'backbone';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import WindowMock from '../../mocks/window';

const Selectors = {
  ...ENTER_EMAIL,
  THIRD_PARTY_AUTH,
};

const EMAIL = 'testuser@testuser.com';

describe('views/index', () => {
  let broker;
  let formPrefill;
  let model;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;
  let viewOptions;

  const createView = (options = viewOptions) => {
    view = new IndexView(options);
  };

  beforeEach(() => {
    broker = new AuthBroker();
    formPrefill = new FormPrefill();
    model = new Model();
    notifier = new Notifier();
    relier = new Relier();
    windowMock = new WindowMock();

    user = new User();

    viewOptions = {
      broker,
      formPrefill,
      model,
      notifier,
      relier,
      user,
      window: windowMock,
    };
    createView(viewOptions);

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

    it('renders the firefox-family services copy', () => {
      return view.render().then(() => {
        assert.include(
          view.$(Selectors.FIREFOX_FAMILY_SERVICES).text(),
          'A Firefox account also unlocks access to more privacy-protecting products from Mozilla.'
        );
      });
    });

    it('prefills the email with React prefillEmail=email and does not navigate', () => {
      const prefillEmail = 'mycoolemail@gmail.com';
      relier.set('prefillEmail', prefillEmail);

      return view
        .render()
        .then(() => view.afterVisible())
        .then(() => {
          assert.isFalse(view.navigate.called);
          assert.equal(view.$(Selectors.EMAIL).val(), prefillEmail);
        });
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

    describe('success message from previous screen', () => {
      it('is displayed', () => {
        model.set('success', 'heyo!');

        return view
          .render()
          .then(() => view.afterVisible())
          .then(() => {
            assert.equal(view.$('.success').text(), 'heyo!');
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
      describe('relier.action === force_auth', () => {
        it('redirects to /force_auth', () => {
          sinon.stub(view, 'chooseEmailActionPage');
          relier.set('action', 'force_auth');
          return view.render().then(() => {
            assert.isTrue(view.replaceCurrentPage.calledOnceWith('force_auth'));
            assert.isFalse(view.chooseEmailActionPage.calledOnce);
          });
        });
      });

      describe('relier.action === signin', () => {
        it('uses email first flow', () => {
          relier.set('action', 'signin');
          return renderTestEnterEmailDisplayed(view, '');
        });
      });

      describe('relier.action === signup', () => {
        it('uses email first flow', () => {
          relier.set('action', 'signup');
          return renderTestEnterEmailDisplayed(view, '');
        });
      });

      describe('relier.action === email', () => {
        it('renders service name when not sync', () => {
          relier.set({
            action: 'email',
            service: 'monitor',
            serviceName: 'Firefox Monitor',
          });

          return renderTestEnterEmailDisplayed(view, 'Firefox Monitor');
        });

        it('does not render service name when service is sync', () => {
          relier.set({
            action: 'email',
            service: 'sync',
            serviceName: 'Firefox Sync',
          });
          sinon.stub(relier, 'isSync').callsFake(() => true);

          return renderTestEnterEmailDisplayed(view, '');
        });

        it('renders expected text when service is sync', () => {
          relier.set({
            action: 'email',
            service: 'sync',
            serviceName: 'Firefox Sync',
          });
          sinon.stub(relier, 'isSync').callsFake(() => true);

          return view.render().then(() => {
            assert.include(
              view.$(Selectors.HEADER).text(),
              'Continue to Firefox accounts'
            );
            assert.include(
              view.$(Selectors.SYNC_DESCRIPTION).text(),
              'Sync your passwords, tabs, and bookmarks everywhere you use Firefox.'
            );
          });
        });

        describe('user is in thirdPartyAuth experiment', () => {
          beforeEach(() => {
            sinon
              .stub(view, 'isInThirdPartyAuthExperiment')
              .callsFake(() => true);
          });

          it('renders as expected when not sync', () => {
            return view.render().then(() => {
              assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 0);
              assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 1);
              assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 1);
            });
          });
          it('renders as expected when sync', () => {
            relier.set({
              action: 'email',
              service: 'sync',
              serviceName: 'Firefox Sync',
            });
            sinon.stub(relier, 'isSync').callsFake(() => true);

            return view.render().then(() => {
              assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);
              assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.GOOGLE), 0);
              assert.lengthOf(view.$(Selectors.THIRD_PARTY_AUTH.APPLE), 0);
            });
          });
        });
      });

      describe('fallback behavior', () => {
        it('uses email first flow', () => {
          return renderTestEnterEmailDisplayed(view, '');
        });
      });
    });
  });

  describe('chooseEmailActionPage', () => {
    it('handles relier specified emails', () => {
      relier.set({
        action: 'email',
        email: 'testuser@testuser.com',
        service: 'sync',
        serviceName: 'Firefox Sync',
      });
      sinon.stub(view, 'checkEmail');

      view.chooseEmailActionPage();
      assert.isTrue(view.checkEmail.calledOnceWith('testuser@testuser.com'));
    });

    it('handled suggested account', () => {
      sinon.stub(view, 'allowSuggestedAccount').returns(true);
      sinon.stub(view, 'replaceCurrentPage');
      const account = {
        email: 'testuser@testuser.com',
      };
      sinon.stub(view, 'suggestedAccount').returns(account);

      view.chooseEmailActionPage();
      assert.isTrue(
        view.replaceCurrentPage.calledOnceWith('signin', { account })
      );
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

        sinon.stub(user, 'checkAccountStatus').callsFake(() =>
          Promise.resolve({
            exists: true,
            hasPassword: true,
            hasLinkedAccount: false,
          })
        );
        sinon.stub(user, 'getAccountByEmail').callsFake(() => storedAccount);

        return view.checkEmail(EMAIL).then(() => {
          assert.isTrue(broker.beforeSignIn.calledOnce);
          const brokerAccount = broker.beforeSignIn.args[0][0];
          assert.equal(brokerAccount.get('email'), EMAIL);

          assert.isTrue(
            view.navigate.calledOnceWith('signin', {
              account: storedAccount,
            })
          );
          const { account } = view.navigate.args[0][1];
          assert.strictEqual(account, storedAccount);
          // Ensure the email is added to the stored account.
          assert.equal(account.get('email'), EMAIL);
        });
      });
    });

    describe('email is not registered', () => {
      it('navigates to signup with email domain MX record validation', () => {
        sinon
          .stub(user, 'checkAccountStatus')
          .callsFake(() => Promise.resolve({ exists: false }));
        sinon.stub(view, '_validateEmailDomain').resolves();
        return view.checkEmail(EMAIL).then(() => {
          assert.isTrue(view.navigate.calledOnceWith('signup'));
          const { account } = view.navigate.args[0][1];
          assert.equal(account.get('email'), EMAIL);
        });
      });

      it('does not navigate away if checkEmailDomain rejects', () => {
        sinon.stub(user, 'checkAccountStatus').resolves({ exists: false });
        sinon.stub(view, '_validateEmailDomain').rejects();
        return view.checkEmail(EMAIL).then(() => {
          assert.isFalse(view.navigate.called);
        });
      });
    });

    describe('MX record validation configurations', () => {
      const email = 'test@example.com';
      it('accepts configurations', () => {
        const config = { mxRecordValidation: { enabled: true } };
        const options = { ...viewOptions, config };
        createView(options);
        assert.deepEqual(view.config, config);
      });

      it('allows email domain with no MX record when the feature is disabled', () => {
        const config = { mxRecordValidation: { enabled: false } };
        const options = { ...viewOptions, config };
        createView(options);
        sinon.stub(user, 'checkAccountStatus').resolves({ exists: false });
        sinon.spy(view, 'navigate');
        return view.checkEmail(email).then(() => {
          assert.isTrue(view.navigate.calledOnceWith('signup'));
          const { account } = view.navigate.args[0][1];
          assert.equal(account.get('email'), email);
        });
      });

      it('allows email domain with no MX record through exclusions', () => {
        const config = {
          mxRecordValidation: { enabled: true, exclusions: ['example.com'] },
        };
        const options = { ...viewOptions, config };
        createView(options);
        sinon.stub(user, 'checkAccountStatus').resolves({ exists: false });
        sinon.spy(view, 'navigate');
        return view
          .render()
          .then(() => view.$('input[type=email]').val(email))
          .then(() => view.checkEmail(email))
          .then(() => {
            assert.isTrue(view.navigate.calledOnceWith('signup'));
            const { account } = view.navigate.args[0][1];
            assert.equal(account.get('email'), email);
          });
      });
    });
  });

  describe('logView', () => {
    let viewEventStub;

    beforeEach(() => {
      viewEventStub = sinon.stub(GleanMetrics.emailFirst, 'view');
    });

    afterEach(() => {
      viewEventStub.restore();
    });

    it('logs a view Glean metrics event', () => {
      view.logView();
      sinon.assert.calledOnce(viewEventStub);
    });
  });

  function renderTestEnterEmailDisplayed(view, expectedServiceName) {
    sinon.spy(view, 'logFlowEventOnce');
    sinon.stub(view, 'chooseEmailActionPage');

    return view.render().then(() => {
      assert.isFalse(view.replaceCurrentPage.called);

      assert.lengthOf(view.$(Selectors.HEADER), 1);
      assert.lengthOf(view.$(Selectors.EMAIL), 1);
      assert.include(view.$(Selectors.SUB_HEADER).text(), expectedServiceName);
      assert.isTrue(view.chooseEmailActionPage.calledOnce);
      assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);

      assert.isTrue(view.logFlowEventOnce.calledOnceWith('begin'));
    });
  }
});
