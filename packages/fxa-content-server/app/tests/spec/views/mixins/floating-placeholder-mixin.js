/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const { assert } = require('chai');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  const FormView = require('views/form');
  const KeyCodes = require('lib/key-codes');
  const Notifier = require('lib/channels/notifier');
  const Template = require('templates/test_template.mustache');

  const TestView = FormView.extend({
    template: Template
  });

  Cocktail.mixin(
    TestView,
    FloatingPlaceholderMixin
  );

  describe('views/mixins/floating-placeholder-mixin', function () {
    let view;

    beforeEach(function () {
      view = new TestView({
        notifier: new Notifier()
      });
      return view.render();
    });

    describe('keyboard input', function () {
      it('no action if enter is pressed with no other input', function () {
        var event = new $.Event('input');
        event.which = KeyCodes.ENTER;

        view.$('#float_me').trigger(event);

        assert.equal(view.$('#float_me').attr('placeholder'), 'placeholder text');
        assert.equal(view.$('.label-helper').text(), '');
      });

      it('floats the placeholder if the input changes', function () {
        view.$('#float_me').val('a');

        var event = new $.Event('input');
        event.which = KeyCodes.ENTER;

        view.$('#float_me').trigger(event);

        assert.equal(typeof view.$('#float_me').attr('placeholder'), 'undefined');
        assert.equal(view.$('.label-helper').text(), 'placeholder text');
      });
    });

    describe('showFloatingPlaceholder', () => {
      it('forces the display of a floating placeholder', () => {
        const $floatMeEl = view.$('#float_me');
        const $labelHelperEl = view.$('.label-helper');

        view.showFloatingPlaceholder('#float_me');

        assert.isUndefined($floatMeEl.attr('placeholder'));
        assert.equal($labelHelperEl.text(), 'placeholder text');
      });
    });

    describe('hideFloatingPlaceholder', () => {
      it('hides the floating placeholder', () => {
        const $floatMeEl = view.$('#float_me');
        const $labelHelperEl = view.$('.label-helper');

        view.showFloatingPlaceholder('#float_me');
        view.hideFloatingPlaceholder('#float_me');

        assert.equal($floatMeEl.attr('placeholder'), 'placeholder text');
        assert.equal($labelHelperEl.text(), '');
      });
    });

    describe('focusLabelHelper', function () {
      it('focuses the floating placeholder by adding the "focused" class', function () {
        view.focusLabelHelper('#float_me');
        assert.isTrue(view.$('#float_me').prev('.label-helper').hasClass('focused'));
      });
    });

    describe('unfocusLabelHelper', function () {
      it('unfocuses the floating placeholder by removing the "focused" class', function () {
        view.unfocusLabelHelper('#float_me');
        assert.isFalse(view.$('#float_me').prev('.label-helper').hasClass('focused'));
      });
    });

  });
});
