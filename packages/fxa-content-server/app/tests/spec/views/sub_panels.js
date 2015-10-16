/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'cocktail',
  'views/sub_panels',
  'views/base',
  'views/mixins/modal-settings-panel-mixin',
  'views/mixins/settings-panel-mixin',
  '../../mocks/router',
  'lib/promise',
  'lib/metrics',
  'stache!templates/test_template',
],
function (chai, $, sinon, Cocktail, View, BaseView,
  ModalSettingsPanelMixin, SettingsPanelMixin, RouterMock, p,
  Metrics, TestTemplate) {
  'use strict';

  var assert = chai.assert;

  var SETTINGS_PANEL_CLASSNAME = 'panel';
  var SettingsPanelView = BaseView.extend({
    className: SETTINGS_PANEL_CLASSNAME,
    template: TestTemplate
  });

  var SettingsPanelView2 = BaseView.extend({
    className: 'panel2',
    template: TestTemplate
  });

  var ModalSettingsPanelView = BaseView.extend({
    className: 'modal-panel',
    template: TestTemplate
  });

  Cocktail.mixin(SettingsPanelView, SettingsPanelMixin);
  Cocktail.mixin(SettingsPanelView2, SettingsPanelMixin);
  Cocktail.mixin(ModalSettingsPanelView, ModalSettingsPanelMixin);

  describe('views/sub-panels', function () {
    var metrics;
    var panelViews;
    var parentView;
    var routerMock;
    var view;

    function createView () {
      view = new View({
        metrics: metrics,
        panelViews: panelViews,
        parentView: parentView,
        router: routerMock
      });
    }

    beforeEach(function () {
      routerMock = new RouterMock();
      metrics = new Metrics();

      panelViews = [
        SettingsPanelView,
        SettingsPanelView2,
        ModalSettingsPanelView
      ];

      createView();
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('subviews', function () {
      it('renders non-modal subviews on render', function () {
        sinon.spy(view, '_createSubViewIfNeeded', function (View) {
          var subview = new View();
          return subview;
        });

        return view.render()
          .then(function () {
            assert.isTrue(view._createSubViewIfNeeded.calledTwice, 'is only called for the non-modal views');
            assert.equal(view._createSubViewIfNeeded.args[0][0], SettingsPanelView);
            assert.equal(view._createSubViewIfNeeded.args[1][0], SettingsPanelView2);
          });
      });

    });

    describe('_createSubViewIfNeeded', function () {
      it('creates, tracks, and renders a subview', function () {
        sinon.spy(view, 'trackSubview');
        sinon.spy(view, 'renderSubView');

        return view._createSubViewIfNeeded(SettingsPanelView)
          .then(function (subView) {
            assert.ok(subView);
            assert.isTrue(view.trackSubview.calledWith(subView));
            assert.isTrue(view.renderSubView.calledWith(subView));
          });
      });

      it('only creates view once', function () {
        var firstSubView;
        return view._createSubViewIfNeeded(SettingsPanelView)
          .then(function (subView) {
            firstSubView = subView;
            return view._createSubViewIfNeeded(SettingsPanelView);
          })
          .then(function (secondSubView) {
            assert.ok(secondSubView);
            assert.strictEqual(firstSubView, secondSubView);
          });
      });

    });

    describe('showSubView', function () {
      it('with non-subpanel view returns', function () {
        return view.showSubView(BaseView)
          .then(function (shownView) {
            assert.isNull(shownView);
          });
      });

      it('showSubView renders and opens', function () {
        sinon.stub(view, '_createSubViewIfNeeded', function (View) {
          var subview = new View();
          sinon.stub(subview, 'openPanel', function () { });
          return p(subview);
        });

        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.showSubView(SettingsPanelView);
          })
          .then(function (subView) {
            assert.isTrue(
                view._createSubViewIfNeeded.calledWith(SettingsPanelView));
            assert.isTrue(subView.openPanel.called);
          });
      });

      it('showSubView destroys previous modal view', function () {
        sinon.stub(view, '_createSubViewIfNeeded', function (View) {
          var subview = new View();
          sinon.stub(subview, 'openPanel', function () { });
          return p(subview);
        });

        var modalSubView;
        return view.showSubView(ModalSettingsPanelView)
          .then(function (subView) {
            modalSubView = subView;
            sinon.stub(subView, 'closePanel', function () { });
            return view.showSubView(SettingsPanelView);
          })
          .then(function (subView) {
            assert.isTrue(modalSubView.closePanel.called);
          });
      });
    });

    describe('renderSubView', function () {
      it('calls render and afterVisible on subview', function () {
        var subview = new View();
        sinon.stub(subview, 'render', function () {
          return p(true);
        });
        sinon.spy(subview, 'afterVisible');

        return view.renderSubView(subview)
          .then(function (renderedSubview) {
            assert.strictEqual(renderedSubview, subview);
            assert.isTrue(subview.render.called);
            assert.isTrue(subview.afterVisible.called);
          });
      });

      it('destroys subview if render fails', function () {
        var subview = new View();
        sinon.stub(subview, 'render', function () {
          return p(false);
        });
        sinon.spy(subview, 'afterVisible');
        sinon.spy(subview, 'destroy');

        return view.renderSubView(subview)
          .then(function (renderedSubview) {
            assert.isUndefined(renderedSubview);
            assert.isTrue(subview.render.called);
            assert.isFalse(subview.afterVisible.called);
            assert.isTrue(subview.destroy.calledWith(true));
          });
      });
    });
  });
});
