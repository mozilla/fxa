/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var PasswordPromptMixin = require('views/mixins/password-prompt-mixin');
  var PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  var sinon = require('sinon');

  var FormView = require('views/form');
  var Template = require('stache!templates/test_template');

  var TestView = FormView.extend({
    template: Template
  });

  Cocktail.mixin(
    TestView,
    PasswordPromptMixin,
    PasswordStrengthMixin
  );

  var TOOLTIP_SELECTOR = '.tooltip-warning';

  var assert = chai.assert;

  describe('views/mixins/password-prompt-mixin', function () {
    var view;

    describe('showPasswordPrompt displays different prompts', function () {
      beforeEach(function () {
        view = new TestView();
        return view.render();
      });

      it('displays the initial password prompt when password field is empty', function () {
        var password = '';
        view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).val(password);
        view.showPasswordPrompt(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR);
        assert.equal(
          view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).siblings(PasswordPromptMixin.INPUT_HELP_FOCUSED).html(),
          PasswordPromptMixin.TOOLTIP_MESSAGES.INITIAL_PROMPT_MESSAGE
        );
      });

      it('displays the focused password prompt when password field is not empty', function () {
        var password = 's';
        view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).val(password);
        view.showPasswordPrompt(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR);
        assert.equal(
          view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).siblings(PasswordPromptMixin.INPUT_HELP_FOCUSED).html(),
          PasswordPromptMixin.TOOLTIP_MESSAGES.FOCUS_PROMPT_MESSAGE
        );
      });
    });

    describe('event triggers call the correct methods', function () {
      beforeEach(function () {
        view = new TestView();
        sinon.spy(view, 'showPasswordPrompt');
        return view.render();
      });

      it('onInputFocus calls showPasswordPrompt with the right password field', function () {
        var event = new $.Event('focus');
        event.currentTarget = PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR;
        view.onInputFocus(event);
        assert.isTrue(view.showPasswordPrompt.calledWith(view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR)));
      });

      it('onInputKeyUp calls showPasswordPrompt with the right password field', function () {
        var event = new $.Event('keyup');
        event.currentTarget = PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR;
        view.onInputKeyUp(event);
        assert.isTrue(view.showPasswordPrompt.calledWith(view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR)));
      });
    });

    describe('checks password strength and displays tooltip if required', function () {
      beforeEach(function () {
        view = new TestView();
        return view.render();
      });

      it('calls checkPasswordStrength with the right password', function () {
        var password = 'charlie2';
        view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          // do nothing
        });
        view.onPasswordBlur();
        assert.isTrue(view.checkPasswordStrength.calledWith('charlie2'));
      });

      it('displays tooltip when password is weak', function (done) {
        var password = 'charlie2';
        view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          view.displayPasswordWarningPrompt();
        });
        view.onPasswordBlur();
        // wait for tooltip
        setTimeout(function () {
          assert.equal(view.$(TOOLTIP_SELECTOR).length, 1);
          done();
        }, 50);
      });

      it('does not display tooltip when password is strong', function (done) {
        var password = 'imstronglol';
        view.$(PasswordPromptMixin.CHECK_PASSWORD_FIELD_SELECTOR).val(password);
        sinon.stub(view, 'checkPasswordStrength', function (password) {
          // do nothing
        });
        view.onPasswordBlur();
        // wait for tooltip
        setTimeout(function () {
          assert.equal(view.$(TOOLTIP_SELECTOR).length, 0);
          done();
        }, 50);
      });
    });

  });
});
