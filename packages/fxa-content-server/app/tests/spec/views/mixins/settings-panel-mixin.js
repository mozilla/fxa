/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'cocktail',
  'views/mixins/settings-panel-mixin',
  'views/base',
  'lib/metrics',
  'stache!templates/test_template'
], function (chai, sinon, Cocktail, SettingsPanelMixin, BaseView,
    Metrics, TestTemplate) {
  'use strict';

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
        superView: {
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
        sinon.stub(view, 'navigate', function () { });
        $('.settings-unit-toggle').click();
        assert.isTrue(view.navigate.calledWith('settings/display_name'));
      });

      it('toggles open and closed', function () {
        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'navigate', function () { });
        $('button.cancel').click();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.navigate.calledWith('settings'));
      });
    });

    describe('methods', function () {
      it('open and close', function () {
        view.openPanel();
        assert.isTrue($('.settings-unit').hasClass('open'));
        view.closePanel();
        assert.isFalse($('.settings-unit').hasClass('open'));
      });

      it('displaySuccess', function () {
        sinon.stub(view, 'closePanel', function () {});
        view.displaySuccess('hi');
        assert.isTrue(view.superView.displaySuccess.calledWith('hi'));
        assert.isTrue(view.closePanel.called);
      });
    });

  });
});

