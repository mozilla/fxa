/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  var FormView = require('views/form');
  var KeyCodes = require('lib/key-codes');
  var Template = require('stache!templates/test_template');

  var assert = chai.assert;

  var TestView = FormView.extend({
    template: Template
  });

  Cocktail.mixin(
    TestView,
    FloatingPlaceholderMixin
  );

  describe('views/mixins/floating-placeholder-mixin', function () {
    var view;

    beforeEach(function () {
      view = new TestView();
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

    describe('showFloatingPlaceholder', function () {
      it('forces the display of a floating placeholder', function () {
        view.showFloatingPlaceholder('#float_me');
        assert.equal(view.$('#float_me').attr('placeholder'), 'placeholder text');
        assert.equal(view.$('.label-helper').text(), '');
      });
    });
  });
});
