/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const BaseView = require('views/base');
  const Chai = require('chai');
  const CheckboxMixin = require('views/mixins/checkbox-mixin');
  const Cocktail = require('cocktail');
  const sinon = require('sinon');
  const Template = require('templates/test_template.mustache');

  var assert = Chai.assert;

  var View = BaseView.extend({
    template: Template
  });

  Cocktail.mixin(
    View,
    CheckboxMixin
  );

  describe('views/mixins/checkbox-mixin', function () {
    var view;

    beforeEach(function () {
      view = new View({
        viewName: 'checkbox-view'
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    it('adds custom checkboxes', function () {
      assert.isTrue($('#container').find('.fxa-checkbox.is-upgraded').length > 0);
    });

    it('logs when a checkbox is toggled on', function () {
      sinon.spy(view, 'logViewEvent');

      view.$('#id-checkbox').click();

      assert.isTrue(view.logViewEvent.calledWith('checkbox.change.id-checkbox.checked'));
    });

    it('logs when a checkbox is toggled off', function () {
      sinon.spy(view, 'logViewEvent');

      view.$('#id-checkbox').attr('checked', 'checked').click();

      assert.isTrue(view.logViewEvent.calledWith('checkbox.change.id-checkbox.unchecked'));
    });

    it('works if the element has a `name` but no `id`', function () {
      sinon.spy(view, 'logViewEvent');
      view.$('input[name="named-checkbox"]').click().click();

      assert.isTrue(view.logViewEvent.calledWith('checkbox.change.named-checkbox.checked'));
      assert.isTrue(view.logViewEvent.calledWith('checkbox.change.named-checkbox.unchecked'));
    });
  });
});

