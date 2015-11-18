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
  var ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var sinon = require('sinon');
  var TestTemplate = require('stache!templates/test_template');
  var View = require('views/sub_panels');

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
    var notifier;
    var panelViews;
    var parentView;
    var view;

    function createView () {
      view = new View({
        metrics: metrics,
        notifier: notifier,
        panelViews: panelViews,
        parentView: parentView,
        createView: function (Constructor, options) {
          return new Constructor(options);
        }
      });
    }

    beforeEach(function () {
      metrics = new Metrics();
      notifier = new Notifier();

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
    });

    describe('childViews', function () {
      it('renders non-modal childViews on render', function () {
        sinon.spy(view, '_createChildViewIfNeeded', function (View) {
          var childView = new View();
          return childView;
        });

        return view.render()
          .then(function () {
            assert.isTrue(view._createChildViewIfNeeded.calledTwice, 'is only called for the non-modal views');
            assert.equal(view._createChildViewIfNeeded.args[0][0], SettingsPanelView);
            assert.equal(view._createChildViewIfNeeded.args[1][0], SettingsPanelView2);
          });
      });

    });

    describe('_createChildViewIfNeeded', function () {
      it('creates, tracks, and renders a childView', function () {
        sinon.spy(view, 'trackChildView');
        sinon.spy(view, 'renderChildView');

        return view._createChildViewIfNeeded(SettingsPanelView)
          .then(function (childView) {
            assert.ok(childView);
            assert.isTrue(view.trackChildView.calledWith(childView));
            assert.isTrue(view.renderChildView.calledWith(childView));
          });
      });

      it('only creates view once', function () {
        var firstChildView;
        return view._createChildViewIfNeeded(SettingsPanelView)
          .then(function (childView) {
            firstChildView = childView;
            return view._createChildViewIfNeeded(SettingsPanelView);
          })
          .then(function (secondChildView) {
            assert.ok(secondChildView);
            assert.strictEqual(firstChildView, secondChildView);
          });
      });

    });

    describe('showChildView', function () {
      it('with non-subpanel view returns', function () {
        return view.showChildView(BaseView)
          .then(function (shownView) {
            assert.isNull(shownView);
          });
      });

      it('showChildView renders and opens', function () {
        sinon.stub(view, '_createChildViewIfNeeded', function (View) {
          var childView = new View();
          sinon.stub(childView, 'openPanel', function () { });
          return p(childView);
        });

        return view.render()
          .then(function () {
            $('#container').append(view.el);
            return view.showChildView(SettingsPanelView);
          })
          .then(function (childView) {
            assert.isTrue(
                view._createChildViewIfNeeded.calledWith(SettingsPanelView));
            assert.isTrue(childView.openPanel.called);
          });
      });

      it('showChildView destroys previous modal view', function () {
        sinon.stub(view, '_createChildViewIfNeeded', function (View) {
          var childView = new View();
          sinon.stub(childView, 'openPanel', function () { });
          return p(childView);
        });

        var modalChildView;
        return view.showChildView(ModalSettingsPanelView)
          .then(function (childView) {
            modalChildView = childView;
            sinon.stub(childView, 'closePanel', function () { });
            return view.showChildView(SettingsPanelView);
          })
          .then(function (childView) {
            assert.isTrue(modalChildView.closePanel.called);
          });
      });
    });

    describe('renderChildView', function () {
      it('calls render and afterVisible on childView', function () {
        var childView = new View();
        sinon.stub(childView, 'render', function () {
          return p(true);
        });
        sinon.spy(childView, 'afterVisible');

        return view.renderChildView(childView)
          .then(function (renderedChildView) {
            assert.strictEqual(renderedChildView, childView);
            assert.isTrue(childView.render.called);
            assert.isTrue(childView.afterVisible.called);
          });
      });

      it('destroys childView if render fails', function () {
        var childView = new View();
        sinon.stub(childView, 'render', function () {
          return p(false);
        });
        sinon.spy(childView, 'afterVisible');
        sinon.spy(childView, 'destroy');

        return view.renderChildView(childView)
          .then(function (renderedChildView) {
            assert.isUndefined(renderedChildView);
            assert.isTrue(childView.render.called);
            assert.isFalse(childView.afterVisible.called);
            assert.isTrue(childView.destroy.calledWith(true));
          });
      });
    });
  });
});
