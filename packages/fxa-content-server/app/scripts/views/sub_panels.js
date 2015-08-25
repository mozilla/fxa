/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This component renders multiple subviews
define([
  'lib/promise',
  'views/base',
  'stache!templates/sub_panels'
],
function (p, BaseView, Template) {
  'use strict';

  var View = BaseView.extend({
    template: Template,
    className: 'sub-panels',

    initialize: function (options) {
      options = options || {};

      this._panelViews = options.panelViews || [];
    },

    showSubView: function (SubView) {
      var self = this;
      if (self._panelViews.indexOf(SubView) === -1) {
        console.warn('Tried to show a view that is not a subpanel');
        return;
      }

      // Destroy any previous modal view
      if (self._currentSubView && self._currentSubView.isModal) {
        self._currentSubView.closePanel();
      }

      return self._createSubViewIfNeeded(SubView)
        .then(function (subView) {
          if (subView) {
            self._currentSubView = subView;
            subView.openPanel();

            return subView;
          }
        });
    },

    _subviewInstanceFromClass: function (SubView) {
      return this.subviews.filter(function (subView) {
        if (subView instanceof SubView) {
          return true;
        }
      })[0];
    },

    _isModalView: function (SubView) {
      return !! SubView.prototype.isModal;
    },

    _subViewClassName: function (SubView) {
      return SubView.prototype.className;
    },

    // Render subview if an instance doesn't already exist
    _createSubViewIfNeeded: function (SubView) {
      var self = this;
      var subView = self._subviewInstanceFromClass(SubView);
      if (subView) {
        return p(subView);
      }

      var className = self._subViewClassName(SubView);
      var selector = '.' + className;

      self.$('.sub-views').append('<div class="settings-subview ' + className + '"></div>');

      var view = self.router.createSubView(SubView, {
        el: self.$(selector)
      });

      self.trackSubview(view);

      return self.router.renderSubView(view);
    },

    afterRender: function () {
      var self = this;

      // Initial subviews to render; excludes modal views
      var initialSubViews = self._panelViews.filter(function (SubView) {
        return ! self._isModalView(SubView);
      });

      return p.all(initialSubViews.map(function (SubView) {
        return self._createSubViewIfNeeded(SubView);
      }));
    }
  });

  return View;
});
