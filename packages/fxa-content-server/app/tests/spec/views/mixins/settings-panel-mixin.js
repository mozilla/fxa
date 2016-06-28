/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var BaseView = require('views/base');
  var chai = require('chai');
  var Cocktail = require('cocktail');
  var Metrics = require('lib/metrics');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');

  var assert = chai.assert;

  var SettingsPanelView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);

  describe('views/mixins/settings-panel-mixin', function () {
    var view;
    var metrics;

    beforeEach(function () {
      metrics = new Metrics();

      view = new SettingsPanelView({
        metrics: metrics,
        parentView: {
          displaySuccess: sinon.spy()
        }
      });

      return view.render()
        .then(function () {
          $('#container').html(view.el);
        });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('events', function () {
      it('toggles button', function () {
        sinon.stub(view, 'navigate', function () {});
        $('.settings-unit-toggle').click();
        assert.isTrue(view.navigate.calledWith('settings/display_name'));
      });

      it('toggles open and closed', function () {
        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'clearInput', function () {});
        sinon.stub(view, 'navigate', function () {});
        $('button.cancel').click();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.clearInput.called);
        assert.isTrue(view.navigate.calledWith('settings'));
      });
    });

    describe('methods', function () {
      it('open and close', function () {
        view.openPanel();
        assert.isTrue($('.settings-unit').hasClass('open'));
        assert.isTrue(view.isPanelOpen());
        view.closePanel();
        assert.isFalse($('.settings-unit').hasClass('open'));
        assert.isFalse(view.isPanelOpen());
      });

      it('displaySuccess', function () {
        sinon.stub(view, 'closePanel', function () {});
        view.displaySuccess('hi');
        assert.isTrue(view.parentView.displaySuccess.calledWith('hi'));
        assert.isTrue(view.closePanel.called);
      });

      it('clears panels', function () {
        view.$('.display-name').val('spc');
        view.$('.display-name').prev('.label-helper').text('placeholder text');
        view.clearInput('.settings-button.cancel');
        assert.isTrue(view.$('.display-name').val() === '');
        assert.isTrue(view.$('.display-name').attr('placeholder') === 'placeholder text');
        assert.isTrue(view.$('.display-name').prev('.label-helper').text() === '');
        assert.isTrue(view.$('.display-name').prev('.label-helper').css('top') === '0px');
      });
    });

  });
});

