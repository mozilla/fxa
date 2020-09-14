/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import FormPrefill from 'models/form-prefill';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import View from 'views/reset_password';

var wrapAssertion = TestHelpers.wrapAssertion;

describe('views/reset_password', function () {
  var broker;
  var formPrefill;
  var metrics;
  var notifier;
  var relier;
  var sentryMetrics;
  var view;

  function createView(options) {
    var viewOptions = _.extend(
      {
        broker: broker,
        canGoBack: true,
        formPrefill: formPrefill,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        viewName: 'reset_password',
      },
      options || {}
    );
    return new View(viewOptions);
  }

  beforeEach(function () {
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    relier = new Relier();

    broker = new Broker({
      relier: relier,
    });

    view = createView();
    return view.render().then(function () {
      $('#container').html(view.el);
    });
  });

  afterEach(function () {
    metrics.destroy();

    view.remove();
    view.destroy();
    $('#container').empty();

    view = metrics = null;
  });

  it('registers for the expected events', () => {
    assert.isFunction(view.events['click .remember-password']);
    assert.isFunction(view.events['click a']);
    assert.isFunction(view.events['click input']);
    assert.isFunction(view.events['input input']);
    assert.isFunction(view.events['keyup input']);
    assert.isFunction(view.events['submit']);
  });

  describe('render', function () {
    it('renders template', function () {
      assert.ok($('#fxa-reset-password-header').length);
    });

    it('shows the remember password button', function () {
      view = createView();

      return view.render().then(() => {
        assert.lengthOf(view.$('.remember-password'), 1);
      });
    });

    it('shows serviceName from the relier', function () {
      var serviceName = 'another awesome service by Mozilla';
      relier.set('serviceName', serviceName);

      // initialize a new view to set the service name
      view = createView();
      return view.render().then(function () {
        assert.include(
          view.$('#fxa-reset-password-header').text(),
          serviceName
        );
      });
    });
  });

  describe('afterRender', () => {
    beforeEach(() => {
      sinon.spy(notifier, 'trigger');
      return view.afterRender();
    });

    it('called notifier.trigger correctly', () => {
      assert.equal(notifier.trigger.callCount, 1);
      assert.equal(notifier.trigger.args[0][0], 'flow.initialize');
    });
  });

  describe('_rememberPassword', () => {
    beforeEach(() => {
      sinon.spy(view, 'navigate');
    });

    it('calls navigate', () => {
      assert.equal(view.navigate.calledOnce, false);
      view._rememberPassword();
      assert.ok(view.navigate.calledOnce);
      assert.ok(view.navigate.args[0], 'signin', 'navigates to signin');
    });
  });

  describe('isValid', function () {
    it('returns true if email address is entered', function () {
      view.$('input[type=email]').val('testuser@testuser.com');
      assert.isTrue(view.isValid());
    });

    it('returns false if email address is empty', function () {
      assert.isFalse(view.isValid());
    });

    it('returns false if email address is invalid', function () {
      view.$('input[type=email]').val('testuser');
      assert.isFalse(view.isValid());
    });
  });

  describe('showValidationErrors', function () {
    it('shows an error if the email is invalid', function (done) {
      view.$('[type=email]').val('testuser');

      view.on('validation_error', function (which, msg) {
        wrapAssertion(function () {
          assert.ok(msg);
        }, done);
      });

      view.showValidationErrors();
    });
  });

  describe('submit with valid input', function () {
    var email;
    beforeEach(function () {
      sinon.stub(view, 'resetPassword').callsFake(function () {
        return Promise.resolve({ passwordForgotToken: 'foo' });
      });

      email = TestHelpers.createEmail();
      view.$('input[type=email]').val(email);

      sinon.spy(view, 'navigate');

      return view.submit();
    });

    it('submits the email address', function () {
      assert.isTrue(view.resetPassword.calledWith(email));
    });
  });

  describe('submit with unknown email address', function () {
    it('shows an error message', function () {
      sinon.stub(view, 'resetPassword').callsFake(function () {
        return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
      });

      var email = TestHelpers.createEmail();
      view.$('input[type=email]').val(email);

      return view.submit().then(function (msg) {
        assert.include(msg, '/signup');
      });
    });
  });

  describe('submit when user cancelled login', function () {
    it('logs an error', function () {
      sinon.stub(view, 'resetPassword').callsFake(function () {
        return Promise.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
      });

      return view
        .submit()
        .then(null, function () {
          assert.isTrue(false, 'unexpected failure');
        })
        .then(function () {
          assert.isFalse(view.isErrorVisible());

          assert.isTrue(TestHelpers.isEventLogged(metrics, 'login.canceled'));
        });
    });
  });

  describe('submit with other error', function () {
    it('passes other errors along', function () {
      sinon.stub(view, 'resetPassword').callsFake(function () {
        return Promise.reject(AuthErrors.toError('INVALID_JSON'));
      });

      return view
        .submit()
        .then(null, function (err) {
          // The errorback will not be called if the submit
          // succeeds, but the following callback always will
          // be. To ensure the errorback was called, pass
          // the error along and check its type.
          return err;
        })
        .then(function (err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_JSON'));
        });
    });
  });

  describe('beforeDestroy', function () {
    it('saves the form email to formPrefill if filled out', function () {
      formPrefill.set('email', 'originalEmail@testuser.com');
      view.$('.email').val('');
      view.beforeDestroy();
      assert.equal(formPrefill.get('email'), 'originalEmail@testuser.com');

      view.$('.email').val('testuser@testuser.com');
      view.beforeDestroy();
      assert.equal(formPrefill.get('email'), 'testuser@testuser.com');
    });
  });
});

describe('views/reset_password with email specified in relier', () => {
  let broker;
  let formPrefill;
  let notifier;
  let relier;
  let view;

  beforeEach(() => {
    relier = new Relier();
    relier.set('email', 'testuser@testuser.com');
    broker = new Broker({
      relier,
    });
    formPrefill = new FormPrefill();
    notifier = new Notifier();

    view = new View({
      broker,
      formPrefill,
      notifier,
      relier,
    });

    return view.render();
  });

  afterEach(() => {
    view.destroy();
    view = null;
  });

  it('does not pre-fills email address', () => {
    assert.equal(view.$('.email').val(), '');
  });
});

describe('views/reset_password with model.forceEmail', () => {
  let broker;
  const email = 'testuser@testuser.com';
  let formPrefill;
  let model;
  let notifier;
  let relier;
  let view;

  beforeEach(() => {
    broker = new Broker({ relier });
    formPrefill = new FormPrefill();
    model = new Backbone.Model({ forceEmail: email });
    notifier = new Notifier();
    relier = new Relier({ email });

    view = new View({
      broker,
      canGoBack: true,
      formPrefill,
      model,
      notifier,
      relier,
    });

    sinon.spy(view, '_resetPassword');
    sinon.spy(view, 'navigate');

    return view.render();
  });

  afterEach(() => {
    view.destroy();
    view = null;
    $('#container').empty();
  });

  it('shows a readonly email, has a back link, does not submit address automatically', () => {
    const $emailInputEl = view.$('[type=email]');
    assert.equal($emailInputEl.val(), email);
    assert.isTrue($emailInputEl.hasClass('hidden'));

    assert.equal(view.$('.prefillEmail').text(), email);
    assert.lengthOf(view.$('.remember-password'), 1);

    assert.isFalse(view._resetPassword.called);
  });

  it('redirects back to force_auth on remembering password', () => {
    assert.equal(view.navigate.calledOnce, false);
    view._rememberPassword();
    assert.ok(view.navigate.calledOnce);
    assert.ok(view.navigate.args[0], 'force_auth', 'navigates to force_auth');
  });
});

describe('views/reset_password with `canGoBack: false`', () => {
  let formPrefill;
  let notifier;
  let relier;
  let view;

  beforeEach(() => {
    formPrefill = new FormPrefill();
    notifier = new Notifier();
    relier = new Relier();

    view = new View({
      canGoBack: false,
      formPrefill,
      notifier,
      relier,
    });

    sinon.spy(view, '_resetPassword');

    return view.render();
  });

  afterEach(() => {
    view.destroy();
  });

  it('does not show remember password button', () => {
    assert.lengthOf(view.$('.remember-password'), 0);
  });
});

describe('views/reset_password with reset_password_confirm=false', function () {
  var view;
  let notifier;
  var relier;
  var broker;
  var formPrefill;

  beforeEach(function () {
    notifier = new Notifier();
    relier = new Relier();
    relier.set('email', 'testuser@testuser.com');
    relier.set('resetPasswordConfirm', false);

    broker = new Broker({
      relier: relier,
    });

    formPrefill = new FormPrefill();

    view = new View({
      broker: broker,
      formPrefill: formPrefill,
      relier: relier,
      notifier,
    });

    sinon.stub(view, 'resetPassword').callsFake(function () {
      return Promise.resolve();
    });

    return view.render();
  });

  afterEach(function () {
    view.destroy();
    view = null;
    $('#container').empty();
  });

  it('submits the email address automatically', function () {
    assert.isTrue(view.resetPassword.calledWith('testuser@testuser.com'));
  });
});
