/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const chai = require('chai');
  const FormPrefill = require('models/form-prefill');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const SentryMetrics = require('lib/sentry');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const View = require('views/reset_password');

  var assert = chai.assert;
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
      var viewOptions = _.extend({
        broker: broker,
        canGoBack: true,
        formPrefill: formPrefill,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        viewName: 'reset_password',
      }, options || {});
      return new View(viewOptions);
    }

    beforeEach(function () {
      formPrefill = new FormPrefill();
      notifier = new Notifier();
      sentryMetrics = new SentryMetrics();
      metrics = new Metrics({ notifier, sentryMetrics });
      relier = new Relier();

      broker = new Broker({
        relier: relier
      });

      view = createView();
      return view.render()
          .then(function () {
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

    describe('render', function () {
      it('renders template', function () {
        assert.ok($('#fxa-reset-password-header').length);
      });

      it('shows the signin button', function () {
        view = createView();

        return view.render()
          .then(function () {
            assert.equal(view.$('a[href="/signin"]').length, 1);
          });
      });

      it('shows serviceName from the relier', function () {
        var serviceName = 'another awesome service by Mozilla';
        relier.set('serviceName', serviceName);

        // initialize a new view to set the service name
        view = createView();
        return view.render()
          .then(function () {
            assert.include(view.$('#fxa-reset-password-header').text(), serviceName);
          });
      });

      describe('with broker that supports `convertExternalLinksToText`', function () {
        beforeEach(function () {
          broker.setCapability('convertExternalLinksToText', true);

          return view.render();
        });

        it('converts the `learn more` link', function () {
          assert.lengthOf(view.$('.visible-url'), 1);
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
        sinon.stub(view, 'resetPassword', function () {
          return p({ passwordForgotToken: 'foo' });
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
        sinon.stub(view, 'resetPassword', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        var email = TestHelpers.createEmail();
        view.$('input[type=email]').val(email);

        return view.submit()
                  .then(function (msg) {
                    assert.include(msg, '/signup');
                  });
      });
    });

    describe('submit when user cancelled login', function () {
      it('logs an error', function () {
        sinon.stub(view, 'resetPassword', function () {
          return p.reject(AuthErrors.toError('USER_CANCELED_LOGIN'));
        });

        return view.submit()
          .then(null, function () {
            assert.isTrue(false, 'unexpected failure');
          })
          .then(function () {
            assert.isFalse(view.isErrorVisible());

            assert.isTrue(TestHelpers.isEventLogged(metrics,
                              'login.canceled'));
          });
      });
    });

    describe('submit with other error', function () {
      it('passes other errors along', function () {
        sinon.stub(view, 'resetPassword', function () {
          return p.reject(AuthErrors.toError('INVALID_JSON'));
        });

        return view.submit()
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
      it('saves the form email to formPrefill', function () {
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
        relier
      });
      formPrefill = new FormPrefill();
      notifier = new Notifier();

      view = new View({
        broker,
        formPrefill,
        notifier,
        relier
      });

      return view.render();
    });

    afterEach(() => {
      view.destroy();
      view = null;
      $('#container').empty();
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
        formPrefill,
        model,
        notifier,
        relier
      });

      sinon.spy(view, '_resetPassword');

      return view.render();
    });

    afterEach(() => {
      view.destroy();
      view = null;
      $('#container').empty();
    });

    it('shows a readonly email', () => {
      const $emailInputEl = view.$('[type=email]');
      assert.equal($emailInputEl.val(), email);
      assert.isTrue($emailInputEl.hasClass('hidden'));

      assert.equal(view.$('.prefillEmail').text(), email);
    });

    it('has a link back to /force_auth', () => {
      assert.ok(view.$('a[href="/force_auth"]').length);
    });

    it('does not submit the email address automatically', () => {
      assert.isFalse(view._resetPassword.called);
    });

    it('removes the back button - the user probably browsed here directly', () => {
      assert.equal(view.$('#back').length, 0);
    });
  });

  describe('views/reset_password with reset_password_confirm=false', function () {
    var view;
    var relier;
    var broker;
    var formPrefill;

    beforeEach(function () {
      relier = new Relier();
      relier.set('email', 'testuser@testuser.com');
      relier.set('resetPasswordConfirm', false);

      broker = new Broker({
        relier: relier
      });

      formPrefill = new FormPrefill();

      view = new View({
        broker: broker,
        formPrefill: formPrefill,
        relier: relier
      });

      sinon.stub(view, 'resetPassword', function () {
        return p();
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
});
