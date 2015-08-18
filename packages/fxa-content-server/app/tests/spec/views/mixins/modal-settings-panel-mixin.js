/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'cocktail',
  'views/mixins/modal-settings-panel-mixin',
  'views/base',
  'lib/metrics',
  'stache!templates/test_template'
], function (chai, sinon, Cocktail, ModalSettingsPanelMixin, BaseView,
    Metrics, TestTemplate) {
  'use strict';

  var assert = chai.assert;

  var ModalSettingsPanelView = BaseView.extend({
    template: TestTemplate
  });

  Cocktail.mixin(ModalSettingsPanelView, ModalSettingsPanelMixin);

  describe('views/mixins/modal-settings-panel-mixin', function () {
    var view;
    var metrics;

    beforeEach(function () {
      metrics = new Metrics();

      view = new ModalSettingsPanelView({
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
      it('toggles open and closed', function () {
        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'navigate', function () { });
        $('button.cancel').click();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.navigate.calledWith('settings'));
      });

      it('back', function () {
        sinon.stub(view, 'navigate', function () { });
        $('.avatar-panel #back').click();
        assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
      });
    });

    describe('methods', function () {
      it('open and close', function () {
        view.openPanel();
        assert.isTrue($.modal.isActive());

        sinon.stub(view, 'closePanel', function () {});
        sinon.stub(view, 'navigate', function () { });
        $.modal.close();
        assert.isTrue(view.closePanel.called);
        assert.isTrue(view.navigate.calledWith('settings'));
        assert.isFalse($.modal.isActive());
      });

      it('closePanel', function () {
        sinon.stub(view, 'destroy', function () { });
        view.closePanel();
        assert.isTrue(view.destroy.calledWith(true));
      });

      it('displaySuccess', function () {
        sinon.stub(view, 'closePanel', function () {});
        view.displaySuccess('hi');
        assert.isTrue(view.superView.displaySuccess.calledWith('hi'));
      });
    });

  });
});

