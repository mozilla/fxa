/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import PasswordMixin from 'views/mixins/password-mixin';
import sinon from 'sinon';
import TestHelpers from '../../../lib/helpers';
import TestTemplate from 'templates/test_template.mustache';
import WindowMock from '../../../mocks/window';

const PasswordView = BaseView.extend({
  template: TestTemplate,
});

Cocktail.mixin(PasswordView, PasswordMixin);

describe('views/mixins/password-mixin', function () {
  let metrics;
  let notifier;
  let view;
  let windowMock;

  beforeEach(function () {
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    windowMock = new WindowMock();

    view = new PasswordView({
      metrics: metrics,
      viewName: 'password-view',
      window: windowMock,
    });

    return view.render();
  });

  describe('onShowPasswordMouseDown', function () {
    it('shows the password', () => {
      sinon.spy(view, 'showPassword');

      const e = $.Event('keyup');
      e.target = view.$('#password');

      view.onShowPasswordMouseDown(e);

      assert.isTrue(view.showPassword.calledOnce);
    });
  });

  describe('show password visibility', () => {
    function testPasswordEntered(eventName) {
      it(`${eventName} with password adds show password label`, () => {
        const $passwordField = view.$('#password');
        $passwordField.val('asdf');
        // label not visible until event is triggered.
        assert.isTrue($passwordField.hasClass('empty'));

        view.$('#password').trigger(eventName);

        assert.isFalse($passwordField.hasClass('empty'));
      });
    }

    function testNoPasswordEntered(eventName) {
      it(`${eventName} without password does not show label`, () => {
        const $passwordField = view.$('#password');
        $passwordField.val('');
        view.$('#password').trigger(eventName);
        assert.isTrue($passwordField.hasClass('empty'));
      });
    }

    testNoPasswordEntered('change');
    testPasswordEntered('change');
    testNoPasswordEntered('keyup');
    testPasswordEntered('keyup');
  });

  describe('show/hide button behavior', () => {
    describe('without a password', () => {
      it('adds password when a password is entered, hides when none', () => {
        // password is initially empty
        const $passwordField = view.$('#password');
        assert.isTrue($passwordField.hasClass('empty'));

        // user types first character
        $passwordField.val('a');
        view.onPasswordChanged({ target: $passwordField.get(0) });
        assert.isFalse($passwordField.hasClass('empty'));

        // user deletes password
        $passwordField.val('');
        view.onPasswordChanged({ target: $passwordField.get(0) });
        assert.isTrue($passwordField.hasClass('empty'));

        // user re-enters first character
        $passwordField.val('b');
        view.onPasswordChanged({ target: $passwordField.get(0) });
        assert.isFalse($passwordField.hasClass('empty'));
      });
    });

    describe('with a password entered', () => {
      beforeEach(() => {
        // ensure the password field contains text
        const $passwordField = view.$('#password');
        $passwordField.val('asdf');
        view.onPasswordChanged({ target: $passwordField.get(0) });
      });

      it('works with mouse events', () => {
        view.$('#password ~ .show-password-label').trigger('mousedown');
        assert.equal(view.$('#password').attr('type'), 'text');

        $(windowMock).trigger('mouseup');
        assert.equal(view.$('#password').attr('type'), 'text');

        view.$('#password ~ .show-password-label').trigger('mousedown');
        assert.equal(view.$('#password').attr('type'), 'password');
      });

      it('logs whether the password is shown or hidden', function () {
        view.$('#password ~ .show-password-label').trigger('mousedown');
        assert.isTrue(
          TestHelpers.isEventLogged(metrics, 'password-view.password.visible')
        );

        // the password has not been hidden yet.
        assert.isFalse(
          TestHelpers.isEventLogged(metrics, 'password-view.password.hidden')
        );

        view.$('#password ~ .show-password-label').trigger('mousedown');
        assert.isTrue(
          TestHelpers.isEventLogged(metrics, 'password-view.password.hidden')
        );
      });

      it('showPassword shows a password', () => {
        const $passwordEl = view.$('#password');
        $passwordEl.val('password');

        view.showPassword('#password');

        assert.equal($passwordEl.attr('type'), 'text');
        assert.equal($passwordEl.attr('autocapitalize'), 'off');
        assert.equal($passwordEl.attr('autocorrect'), 'off');

        // Ensure the show password state stays in sync
        const $showPasswordEl = $passwordEl.siblings('.show-password');
        assert.isTrue($showPasswordEl.is(':checked'));
      });

      it('hidePassword hides a visible password', () => {
        view.showPassword('#password');
        view.hidePassword('#password');

        const $passwordEl = view.$('#password');
        assert.equal($passwordEl.attr('autocomplete'), null);
        assert.equal($passwordEl.attr('autocapitalize'), null);
        assert.equal($passwordEl.attr('autocorrect'), null);

        // Ensure the show password state stays in sync
        const $showPasswordEl = $passwordEl.siblings('.show-password');
        assert.isFalse($showPasswordEl.is(':checked'));
      });

      it('getAffectedPasswordInputs - gets all affected inputs', function () {
        $('#container').html(view.$el);
        let targets = view.getAffectedPasswordInputs('#show-password');
        assert.lengthOf(targets, 1);

        view.$('#vpassword').attr('data-synchronize-show', 'true');
        targets = view.getAffectedPasswordInputs('#show-password');
        assert.lengthOf(targets, 2);
      });
    });
  });

  describe('hideVisiblePasswords', () => {
    it('sets all password fields to type `password`', () => {
      const $passwordEls = view.$('.password');

      assert.equal($passwordEls.length, 2);

      $passwordEls.each((index, el) => {
        view.showPassword(el);
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

  describe('_logErrorConvertingPasswordType', () => {
    it('logs an error when password type cannot be converted', () => {
      const $mockEl = {
        attr() {
          return 'password';
        },
      };

      sinon.spy(view, 'logError');

      view._logErrorConvertingPasswordType($mockEl);

      assert.isTrue(view.logError.calledOnce);
      const err = view.logError.args[0][0];
      assert.isTrue(AuthErrors.is(err, 'CANNOT_CHANGE_INPUT_TYPE'));
      assert.equal(err.type, 'password');
    });
  });
});
