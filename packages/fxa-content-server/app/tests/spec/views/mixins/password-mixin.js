/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const PasswordMixin = require('views/mixins/password-mixin');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../../lib/helpers');
  const TestTemplate = require('stache!templates/test_template');

  const PasswordView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(
    PasswordView,
    PasswordMixin,
    ExperimentMixin
  );

  describe('views/mixins/password-mixin', function () {
    let metrics;
    let relier;
    let view;

    beforeEach(function () {
      relier = new Relier();
      metrics = new Metrics();

      view = new PasswordView({
        metrics: metrics,
        notifier: new Notifier(),
        relier: relier,
        viewName: 'password-view'
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      $('#container').empty();
    });

    describe('afterVisible', function () {
      it('notifier not called by default', function () {
        sinon.spy(view.notifier, 'trigger');
        view.afterVisible();
        assert.isFalse(view.notifier.trigger.called);
      });

      it('notifier called if part of an experiment', function () {
        sinon.spy(view.notifier, 'trigger');
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });
        view.afterVisible();
        assert.isTrue(view.notifier.trigger.called);
      });

      it('hides show password button if part of an experiment', function () {
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });

        sinon.stub(view, 'isInExperimentGroup', function () {
          return true;
        });
        view.afterVisible();
        assert.isTrue(view.$('.show-password-label').is(':hidden'));
      });

      it('shows show password button if part of an experiment control', function () {
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });

        sinon.stub(view, 'isInExperimentGroup', function () {
          return false;
        });
        view.afterVisible();
        assert.isFalse(view.$('.show-password-label').is(':hidden'));
      });
    });

    describe('onPasswordVisibilityChange', function () {
      it('tracks the experiment click ', function () {
        sinon.stub(view, 'isInExperiment', function () {
          return true;
        });

        sinon.stub(view, 'isInExperimentGroup', function () {
          return true;
        });
        sinon.spy(view.notifier, 'trigger');

        view.afterVisible();
        view.$('.show-password').trigger('change');
        assert.isTrue(view.notifier.trigger.calledWith('showPassword.clicked'));
      });
    });

    describe('setPasswordVisibility', () => {
      it('to visible', () => {
        const $passwordEl = view.$('#password');
        $passwordEl.val('password').focus();

        const selectionStart = 1;
        const selectionEnd = 2;

        const passwordEl = $passwordEl.get(0);
        passwordEl.selectionStart = selectionStart;
        passwordEl.selectionEnd = selectionEnd;

        view.setPasswordVisibility('#password', true);

        assert.equal($passwordEl.attr('type'), 'text');
        assert.equal($passwordEl.attr('autocapitalize'), 'off');
        assert.equal($passwordEl.attr('autocorrect'), 'off');

        // Ensure the cursor is replaced to its original position.
        // Only make the check if the document has focus, otherwise
        // the test fails. Document may not have focus if the dev
        // clicks out of the test window or when run in PhantomJS.
        TestHelpers.ifDocumentFocused(() => {
          assert.equal(passwordEl.selectionStart, selectionStart);
          assert.equal(passwordEl.selectionEnd, selectionEnd);
        });

        // Ensure the show password state stays in sync
        const $showPasswordEl = $passwordEl.siblings('.show-password');
        assert.isTrue($showPasswordEl.is(':checked'));
      });

      it('to hidden', () => {
        view.setPasswordVisibility('#password', false);

        const $passwordEl = view.$('#password');
        assert.equal($passwordEl.attr('autocomplete'), null);
        assert.equal($passwordEl.attr('autocapitalize'), null);
        assert.equal($passwordEl.attr('autocorrect'), null);

        // Ensure the show password state stays in sync
        const $showPasswordEl = $passwordEl.siblings('.show-password');
        assert.isFalse($showPasswordEl.is(':checked'));
      });
    });

    describe('setPasswordVisibilityFromButton', function () {
      it('sets the password field to type=text if button is checked', function () {
        view.$('#show-password').attr('checked', 'checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'text');
      });

      it('sets the password field to type=password if button is unchecked', function () {
        view.$('#show-password').removeAttr('checked');
        view.setPasswordVisibilityFromButton('#show-password');
        assert.equal(view.$('#password').attr('type'), 'password');
      });
    });

    describe('clicking on unsynched/synched show buttons', function () {
      it('gets password inputs to be shown', function () {
        let targets = view.getAffectedPasswordInputs('#show-password');
        assert.equal(targets.length, 1);

        view.$('#show-password').data('synchronize-show', 'true');
        targets = view.getAffectedPasswordInputs('#show-password');
        assert.equal(targets.length, 2);
      });
    });

    describe('clicking on the show button', function () {
      it('pw field set to text when clicked', function () {
        view.$('.show-password').click();
        assert.equal(view.$('#password').attr('type'), 'text');
        assert.equal(view.$('#vpassword').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        view.$('.show-password').click();
        view.$('.show-password').click();
        assert.equal(view.$('#password').attr('type'), 'password');
        assert.equal(view.$('#vpassword').attr('type'), 'password');
      });

      it('logs whether the password is shown or hidden', function () {
        view.$('.show-password').click();
        assert.isTrue(TestHelpers.isEventLogged(metrics,
                          'password-view.password.visible'));
        // the password has not been hidden yet.
        assert.isFalse(TestHelpers.isEventLogged(metrics,
                          'password-view.password.hidden'));

        view.$('.show-password').click();
        assert.isTrue(TestHelpers.isEventLogged(metrics,
                          'password-view.password.hidden'));
      });
    });

    describe('show passwordHelper', function () {
      it('set warning opacity to 1 if any password length is less than 8', function () {
        view.$('#password').val('1234');
        view.$('#vpassword').val('12345678');
        view.$('#old_password').val('12345678');
        view.$('#new_password').val('12345678');
        view.onPasswordKeyUp();
        assert.equal(view.$('.input-help').css('opacity'), '1');
        assert.equal(view.$('.input-help-forgot-pw').css('opacity'), '1');
      });
    });

    describe('hide passwordHelper', function () {
      it('set warning opacity to 0 if password length is greater than or equal to 8', function () {
        view.$('#password').val('12345678');
        view.$('#vpassword').val('12345678');
        view.$('#old_password').val('12345678');
        view.$('#new_password').val('123456789');
        view.onPasswordKeyUp();
        assert.equal(view.$('.input-help').css('opacity'), '0');
        assert.equal(view.$('.input-help-forgot-pw').css('opacity'), '1');
      });
    });

    describe('hideVisiblePasswords', () => {
      it('sets all password fields to type `password`', () => {
        const $passwordEls = view.$('.password');

        assert.equal($passwordEls.length, 2);

        $passwordEls.each((index, el) => {
          view.setPasswordVisibility(el, true);
          assert.equal(el.type, 'text');
        });

        view.hideVisiblePasswords();

        $passwordEls.each((i, el) => {
          assert.equal(el.type, 'password');
        });
      });
    });

    describe('submitStart event', () => {
      beforeEach(() => {
        sinon.spy(view, 'hideVisiblePasswords');
      });

      it('hides all visible passwords', () => {
        assert.equal(view.hideVisiblePasswords.callCount, 0);
        view.trigger('submitStart');
        assert.equal(view.hideVisiblePasswords.callCount, 1);
      });
    });
  });
});
