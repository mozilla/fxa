/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This component renders multiple childViews
define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var p = require('lib/promise');
  var Template = require('stache!templates/sub_panels');

  var View = BaseView.extend({
    template: Template,
    className: 'sub-panels',

    initialize: function (options) {
      options = options || {};

      this._panelViews = options.panelViews || [];
      this._parent = options.parent;
      this._createView = options.createView;
    },

    showChildView: function (ChildView) {
      var self = this;
      if (self._panelViews.indexOf(ChildView) === -1) {
        console.warn('Tried to show a view that is not a subpanel');
        return p(null);
      }

      // Destroy any previous modal view
      if (self._currentChildView && self._currentChildView.isModal) {
        self._currentChildView.closePanel();
      }

      return self._createChildViewIfNeeded(ChildView)
        .then(function (childView) {
          if (childView) {
            self._currentChildView = childView;
            childView.openPanel();

            return childView;
          }
        });
    },

    _childViewInstanceFromClass: function (ChildView) {
      return this.childViews.filter(function (childView) {
        if (childView instanceof ChildView) {
          return true;
        }
      })[0];
    },

    _isModalView: function (ChildView) {
      return !! ChildView.prototype.isModal;
    },

    _childViewClassName: function (ChildView) {
      return ChildView.prototype.className;
    },

    // Render childView if an instance doesn't already exist
    _createChildViewIfNeeded: function (ChildView) {
      var self = this;
      var childView = self._childViewInstanceFromClass(ChildView);
      if (childView) {
        return p(childView);
      }

      var className = self._childViewClassName(ChildView);
      var selector = '.' + className;

      self.$('.child-views').append('<div class="settings-child-view ' + className + '"></div>');

      var view = self._createView(ChildView, {
        el: self.$(selector),
        parentView: self._parent
      });

      self.trackChildView(view);

      return self.renderChildView(view);
    },

    renderChildView: function (viewToShow) {
      return viewToShow.render()
        .then(function (shown) {
          if (! shown) {
            viewToShow.destroy(true);
            return;
          }

          viewToShow.afterVisible();

          return viewToShow;
        });
    },

    afterRender: function () {
      var self = this;

      // Initial childViews to render; excludes modal views
      var initialChildViews = self._panelViews.filter(function (ChildView) {
        return ! self._isModalView(ChildView);
      });

      return p.all(initialChildViews.map(function (ChildView) {
        return self._createChildViewIfNeeded(ChildView);
      }));
    }
  });

  module.exports = View;
});
