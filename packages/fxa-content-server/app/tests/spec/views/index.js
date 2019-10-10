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

    describe('user is too young', () => {
      it('redirects to `/cannot_create_account`', () => {
        windowMock.document.cookie = 'tooyoung; 1';

        return view.render().then(() => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('cannot_create_account'));
        });
      });
    });

    describe('current account', () => {
      it('replaces current page with to `/settings`', function() {
        const signedInAccount = user.initAccount({
          sessionToken: 'token',
        });
        sinon.stub(user, 'getSignedInAccount').callsFake(() => signedInAccount);
        return view.render().then(() => {
          assert.isTrue(view.replaceCurrentPage.calledOnce);
          assert.isTrue(view.replaceCurrentPage.calledWith('settings'));
        });
      });
    });

    describe('no current account', () => {
      it('renders as expected, starts the flow metrics', () => {
        relier.set({
          service: 'sync',
          serviceName: 'Firefox Sync',
        });

        sinon.spy(view, 'logFlowEventOnce');

        return view.render().then(() => {
          assert.isFalse(view.replaceCurrentPage.called);

          assert.lengthOf(view.$('#fxa-enter-email-header'), 1);
          assert.lengthOf(view.$('input[type=email]'), 1);
          assert.include(view.$('.service').text(), 'Firefox Sync');
          assert.lengthOf(view.$(Selectors.FIREFOX_FAMILY_SERVICES), 1);

          assert.isTrue(view.logFlowEventOnce.calledOnce);
          assert.isTrue(view.logFlowEventOnce.calledWith('begin'));
        });
      });

      it('handles relier specified emails', () => {
        relier.set({
          action: 'email',
          email: 'testuser@testuser.com',
          service: 'sync',
          serviceName: 'Firefox Sync',
        });

        sinon.stub(view, 'checkEmail').callsFake(() => Promise.resolve());

        return view.render().then(() => {
          assert.isTrue(
            view.checkEmail.calledOnceWith('testuser@testuser.com')
          );
        });
      });
    });
  });

  describe('showValidationErrorsEnd', function() {
    beforeEach(() => {
      relier.set('action', 'email');
      sinon.spy(view, 'showValidationError');

      return view.render();
    });

    it('shows an error if the user provides a @firefox.com email', function() {
      view.$('input[type=email]').val('firefox@firefox.com');
      view.showValidationErrorsEnd();
      assert.isTrue(view.showValidationError.calledOnce);

      assert.equal(view.showValidationError.args[0][0], 'input[type=email]');
      assert.isTrue(
        AuthErrors.is(
          view.showValidationError.args[0][1],
          'DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'
        )
      );
    });

    it('shows an error if the user provides a @firefox email', function() {
      view.$('input[type=email]').val('firefox@firefox');
      view.showValidationErrorsEnd();
      assert.isTrue(view.showValidationError.calledOnce);

      assert.equal(view.showValidationError.args[0][0], 'input[type=email]');
      assert.isTrue(
        AuthErrors.is(
          view.showValidationError.args[0][1],
          'DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN'
        )
      );
    });

    it('does not show an error if firefox.com is in the local side of the email address', () => {
      view.$('input[type=email]').val('firefox.com@testuser.com');
      view.showValidationErrorsEnd();
      assert.equal(view.showValidationError.callCount, 0);
    });

    it('does not show an error if the user provides non @firefox.com email', function() {
      view.$('input[type=email]').val('another@testuser.com');
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
          view.$('input[type=email]').val(EMAIL);
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
});
