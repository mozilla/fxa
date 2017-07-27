/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('views/mixins/no-disabled-submit-experiment-mixin');
  const FormView = require('views/form');
  const Notifier = require('lib/channels/notifier');
  const Template = require('stache!templates/test_template');

  const TestView = FormView.extend({
    template: Template
  });

  Cocktail.mixin(
    TestView,
    FloatingPlaceholderMixin
  );

  describe('views/mixins/no-disabled-submit-experiment-mixin', function () {
    let view;

    beforeEach(function () {
      view = new TestView({
        notifier: new Notifier()
      });
      return view.render();
    });

    describe('afterRender', function () {
      it('removes attr if treatment', function () {
        assert.ok(view.$('button[type=submit].disabled').length, 'is disabled');
        view.isInExperimentGroup = (name, group) => {
          return group === 'treatment';
        };
        view.afterRender();
        assert.notOk(view.$('button[type=submit].disabled').length, 'is enabled');
      });

      it('keeps attr if treatment', function () {
        assert.ok(view.$('button[type=submit].disabled').length, 'is disabled');
        view.isInExperimentGroup = (name, group) => {
          return group === 'control';
        };
        view.afterRender();
        assert.ok(view.$('button[type=submit].disabled').length, 'is disabled');
      });
    });

    describe('disableForm', () => {
      it('remotes attr if treatment', function () {
        assert.ok(view.$('button[type=submit].disabled').length, 'is disabled');
        view.isInExperimentGroup = (name, group) => {
          return group === 'treatment';
        };
        view.afterRender();
        assert.notOk(view.$('button[type=submit].disabled').length, 'is enabled');
      });
    });

  });
});
