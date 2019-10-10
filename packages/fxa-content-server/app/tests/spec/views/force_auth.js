/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import { FORCE_AUTH } from '../../../../tests/functional/lib/selectors';
import FormPrefill from 'models/form-prefill';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import Translator from 'lib/translator';
import User from 'models/user';
import View from 'views/force_auth';
import WindowMock from '../../mocks/window';

const Selectors = FORCE_AUTH;

describe('/views/force_auth', () => {
  var broker;
  var email;
  var formPrefill;
  var metrics;
  var model;
  var notifier;
  var relier;
  var user;
  var translator;
  var view;
  var windowMock;

  var isEmailRegistered;
  var isUidRegistered;

  function initDeps() {
    broker = new Broker();
    email = TestHelpers.createEmail();
    formPrefill = new FormPrefill();
    model = new Backbone.Model();
    notifier = new Notifier();
    metrics = new Metrics({
      notifier,
      sentryMetrics: {
        captureException() {},
      },
    });
    translator = new Translator({ forceEnglish: true });
    relier = new Relier({ service: 'sync' });
    user = new User({
      metrics,
      notifier,
    });
    user.getSignedInAccount().set('uid', 'foo');

    isEmailRegistered = isUidRegistered = false;

    sinon.stub(user, 'checkAccountEmailExists').callsFake(() => {
      return Promise.resolve(isEmailRegistered);
    });

    sinon.stub(user, 'checkAccountUidExists').callsFake(() => {
      return Promise.resolve(isUidRegistered);
    });

    windowMock = new WindowMock();

    view = new View({
      broker: broker,
      formPrefill: formPrefill,
      metrics: metrics,
      model: model,
      notifier: notifier,
      relier: relier,
      translator: translator,
      user: user,
      viewName: 'force-auth',
      window: windowMock,
    });

    sinon.spy(view, 'navigate');
    sinon.spy(view, 'fatalError');

    $(windowMock.document.body).attr(
      'data-flow-id',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    $(windowMock.document.body).attr('data-flow-begin', Date.now());
    notifier.trigger('flow.initialize');
  }

  beforeEach(() => {
    initDeps();

    relier.set('email', email);
  });

  afterEach(() => {
    view.remove();
    view.destroy();
    view = null;
  });

  describe('render', () => {
    describe('with a missing email address', () => {
      beforeEach(() => {
        relier.unset('email');

        return view.render();
      });

      it('delegates to fatalError', () => {
        assert.isTrue(view.fatalError.called);
      });
    });

    describe('with an invalid email address', () => {
      beforeEach(() => {
        relier.set('email', 'not an email');

        return view.render();
      });

      it('delegates to fatalError', () => {
        assert.isTrue(view.fatalError.called);
      });
    });

    describe('with an invalid uid', () => {
      beforeEach(() => {
        relier.set('uid', 'invalid uid');

        return view.render();
      });

      it('delegates to fatalError', () => {
        assert.isTrue(view.fatalError.called);
      });
    });

    describe('with registered email, no uid', () => {
      beforeEach(() => {
        isEmailRegistered = true;

        return view.render();
      });

      it('renders as expected', () => {
        assert.isFalse(view.navigate.called);
        assert.equal(view.$(Selectors.EMAIL).val(), email);
        assert.equal(view.$(Selectors.EMAIL_NOT_EDITABLE).text(), email);
        assert.lengthOf(view.$('.error.visible'), 0);
      });
    });

    describe('with registered email, registered uid', () => {
      beforeEach(() => {
        relier.set({
          uid: TestHelpers.createUid(),
        });

        isEmailRegistered = isUidRegistered = true;

        return view.render();
      });

      it('renders as expected', () => {
        assert.isFalse(view.navigate.called);
        assert.lengthOf(view.$(Selectors.SUB_HEADER), 0);
        assert.equal(view.$(Selectors.EMAIL).val(), email);
        assert.equal(view.$(Selectors.EMAIL_NOT_EDITABLE).text(), email);
        assert.lengthOf(view.$('.error.visible'), 0);
      });
    });

    describe('with service=sync', () => {
      it('has the service title', () => {
        relier.set({
          serviceName: 'Firefox Sync',
          uid: TestHelpers.createUid(),
        });

        return view.render().then(() => {
          assert.equal(
            view.$(Selectors.SUB_HEADER).text(),
            'Continue to Firefox Sync'
          );
        });
      });
    });

    describe('with registered email, unregistered uid', () => {
      beforeEach(() => {
        relier.set({
          uid: TestHelpers.createUid(),
        });

        isEmailRegistered = true;
      });

      describe('broker supports UID change', () => {
        beforeEach(() => {
          broker.setCapability('allowUidChange', true);
          return view.render();
        });

        it('does not navigate', () => {
          assert.isFalse(view.navigate.called);
        });

        it('does not error', () => {
          assert.lengthOf(view.$('.error.visible'), 0);
        });
      });

      describe('broker does not support UID change', () => {
        beforeEach(() => {
          broker.unsetCapability('allowUidChange');
          sinon.spy(view, 'displayError');
          return view.render().then(() => view.afterVisible());
        });

        it('does not navigate', () => {
          assert.isFalse(view.navigate.called);
        });

        it('displays the error', () => {
          assert.isTrue(view.displayError.called);
        });
      });
    });

    describe('with unregistered email, no uid', () => {
      beforeEach(() => {
        isEmailRegistered = false;
        return view.render();
      });

      it('navigates to signup', () => {
        testNavigatesToForceSignUp(view, email);
      });
    });

    describe('with unregistered email, registered uid', () => {
      beforeEach(() => {
        relier.set({
          uid: TestHelpers.createUid(),
        });

        isEmailRegistered = false;
        isUidRegistered = true;
      });

      describe('broker supports UID change', () => {
        beforeEach(() => {
          broker.setCapability('allowUidChange', true);
          return view.render();
        });

        it('navigates to signup', () => {
          testNavigatesToForceSignUp(view, email);
        });
      });

      describe('broker does not support UID change', () => {
        beforeEach(() => {
          broker.unsetCapability('allowUidChange');
          sinon.spy(view, 'displayError');
          return view.render().then(() => view.afterVisible());
        });

        it('does not navigate', () => {
          assert.isFalse(view.navigate.called);
        });

        it('displays the error', () => {
          assert.isTrue(view.displayError.called);
        });
      });
    });

    describe('with unregistered email, unregistered uid', () => {
      beforeEach(() => {
        relier.set({
          uid: TestHelpers.createUid(),
        });

        isEmailRegistered = isUidRegistered = false;
      });

      describe('broker supports UID change', () => {
        beforeEach(() => {
          broker.setCapability('allowUidChange', true);
          return view.render();
        });

        it('navigates to signup', () => {
          testNavigatesToForceSignUp(view, email);
        });
      });

      describe('broker does not support UID change', () => {
        beforeEach(() => {
          broker.unsetCapability('allowUidChange');
          sinon.spy(view, 'displayError');
          return view.render().then(() => view.afterVisible());
        });

        it('does not navigate', () => {
          assert.isFalse(view.navigate.called);
        });

        it('displays the error', () => {
          assert.isTrue(view.displayError.called);
        });
      });
    });

    describe('with form prefill', () => {
      beforeEach(() => {
        formPrefill.set('password', 'password');

        isEmailRegistered = true;

        return view.render();
      });

      it('prefills password', () => {
        assert.equal(view.$('input[type=password]').val(), 'password');
      });
    });

    describe('email registered behaviors', () => {
      beforeEach(() => {
        isEmailRegistered = true;

        sinon.spy(view, 'displayAccountProfileImage');

        return view.render().then(() => {
          view.afterVisible();
        });
      });

      it('email input is hidden for the Firefox Password manager', () => {
        assert.equal(view.$('input[type=email]').hasClass('hidden'), 1);
      });

      it('user cannot create an account', () => {
        assert.equal(view.$('a[href="/signup"]').length, 0);
      });

      it('delegates to `displayAccountProfileImage` with the correct email', () => {
        assert.isTrue(view.displayAccountProfileImage.called);

        var account = view.displayAccountProfileImage.args[0][0];
        assert.instanceOf(account, Account);

        var options = view.displayAccountProfileImage.args[0][1];
        assert.isTrue(options.spinner);
      });

      it('isValid is successful when the password is filled out', () => {
        view.$('.password').val('password');
        assert.isTrue(view.isValid());
      });
    });

    describe('`INCORRECT_PASSWORD` passed in from the previous view', () => {
      beforeEach(() => {
        isEmailRegistered = true;

        model.set('error', AuthErrors.toError('INCORRECT_PASSWORD'));

        return view.render().then(() => view.afterVisible());
      });

      it('renders the error, allows user to enter their password again', () => {
        assert.include(
          view
            .$('.error')
            .text()
            .toLowerCase(),
          'incorrect password'
        );
        assert.lengthOf(view.$('input[type=password]'), 1);
      });
    });
  });

  describe('submit', () => {
    var password = 'password';

    beforeEach(() => {
      // stub out `beforeRender` to ensure no redirect occurs.
      sinon.stub(view, 'beforeRender').callsFake(() => Promise.resolve());
      sinon.stub(view, '_signIn').callsFake(function(account) {
        return Promise.resolve();
      });

      return view.render().then(() => {
        view.$('input[type=password]').val(password);

        return view.submit();
      });
    });

    it('calls view._signIn with the expected data', () => {
      var account = view._signIn.args[0][0];
      assert.equal(account.get('email'), email);

      var signInPassword = view._signIn.args[0][1];
      assert.equal(signInPassword, password);
    });
  });

  describe('onSignInError', () => {
    var account;
    var err;

    beforeEach(() => {
      account = user.initAccount({
        email: email,
      });
    });

    describe('account was deleted after page load', () => {
      beforeEach(() => {
        err = AuthErrors.toError('UNKNOWN_ACCOUNT');
      });

      describe('uid specified', () => {
        beforeEach(() => {
          relier.set('uid', 'uid');
        });

        describe('broker supports UID change', () => {
          beforeEach(() => {
            broker.setCapability('allowUidChange', true);

            return view.onSignInError(account, 'password', err);
          });

          it('navigates to `signup` with expected data', () => {
            testNavigatesToForceSignUp(view, email);
          });
        });

        describe('brokers does not support UID change', () => {
          beforeEach(() => {
            broker.unsetCapability('allowUidChange');

            sinon.spy(view, 'displayError');

            return view.onSignInError(account, 'password', err);
          });

          it('prints an error message and does not allow the user to sign up', () => {
            assert.isTrue(view.displayError.called);
            var err = view.displayError.args[0][0];
            assert.isTrue(AuthErrors.is(err, 'DELETED_ACCOUNT'));
            // no link to sign up.
            assert.equal(view.$('.error').find('a').length, 0);
          });
        });
      });

      describe('no uid specified', () => {
        beforeEach(() => {
          relier.unset('uid');

          return view.onSignInError(account, 'password', err);
        });

        it('navigates to `signup` with expected data', () => {
          var args = view.navigate.args[0];
          assert.equal(args[0], 'signup');

          var navigateData = args[1];
          assert.isTrue(AuthErrors.is(navigateData.error, 'DELETED_ACCOUNT'));
          assert.equal(navigateData.forceEmail, email);
        });
      });
    });

    describe('all other errors', () => {
      it('are re-thrown', () => {
        err = AuthErrors.toError('UNEXPECTED_ERROR');

        return view
          .onSignInError(account, 'password', err)
          .then(assert.fail, _err => {
            assert.strictEqual(_err, err);
          });
      });
    });
  });

  describe('_navigateToForceResetPassword', () => {
    beforeEach(() => {
      return view._navigateToForceResetPassword();
    });

    it('navigates to `/reset_password` with the expected email', () => {
      assert.isTrue(
        view.navigate.calledWith('reset_password', {
          forceEmail: email,
        })
      );
    });
  });

  describe('beforeDestroy', () => {
    beforeEach(() => {
      isEmailRegistered = true;

      return view.render().then(() => {
        view.$('.password').val('password');
        view.beforeDestroy();
      });
    });

    it('saves the form info to formPrefill', () => {
      assert.equal(formPrefill.get('password'), 'password');
    });
  });

  describe('flow events', () => {
    beforeEach(() => {
      // stub out `beforeRender` to ensure no redirection occurs.
      sinon.stub(view, 'beforeRender').callsFake(() => Promise.resolve());
      return view.render().then(() => {
        view.afterVisible();
      });
    });

    it('logs the begin event', () => {
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'flow.begin'));
    });

    it('logs the engage event (click)', () => {
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
      view.$('input').trigger('click');
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
    });

    it('logs the engage event (input)', () => {
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
      view.$('input').trigger('input');
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
    });

    it('logs the engage event (keyup)', () => {
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
      view.$('input').trigger({
        type: 'keyup',
        which: 9,
      });
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
    });

    it('logs the forgot-password event', () => {
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.forgot-password')
      );
      view.$('[data-flow-event="forgot-password"]').click();
      assert.isFalse(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.engage')
      );
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.forgot-password')
      );
    });

    it('logs the submit event', () => {
      $('#container').html(view.el);
      view.$('#submit-btn').click();
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'flow.force-auth.submit')
      );
    });
  });
});

function testNavigatesToForceSignUp(view, email) {
  assert.isTrue(view.navigate.called);

  var url = view.navigate.args[0][0];
  assert.equal(url, 'signup');

  var navigateData = view.navigate.args[0][1];
  assert.isTrue(AuthErrors.is(navigateData.error, 'DELETED_ACCOUNT'));
  assert.equal(navigateData.forceEmail, email);
}
