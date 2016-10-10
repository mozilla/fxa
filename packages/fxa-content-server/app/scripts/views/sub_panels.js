/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This component renders multiple childViews
define(function (require, exports, module) {
  'use strict';

  const Backbone = require('backbone');
  const BaseView = require('views/base');
  const Logger = require('lib/logger');
  const p = require('lib/promise');
  const Template = require('stache!templates/sub_panels');

  const proto = BaseView.prototype;
  const View = BaseView.extend({
    template: Template,
    className: 'sub-panels',

    initialize: function (options) {
      options = options || {};

      this._panelViews = options.panelViews || [];
      this._parent = options.parent;
      this._createView = options.createView;
      this._logger = new Logger();
    },

    showChildView: function (ChildView, options) {
      var self = this;
      if (self._panelViews.indexOf(ChildView) === -1) {
        self._logger.warn('Tried to show a view that is not a subpanel');
        return p(null);
      }

      // Destroy any previous modal view
      if (self._currentChildView && self._currentChildView.isModal) {
        self._currentChildView.closePanel();
      }

      return self._createChildViewIfNeeded(ChildView, options)
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
    _createChildViewIfNeeded: function (ChildView, options) {
      options = options || {};

      var self = this;
      var childView = self._childViewInstanceFromClass(ChildView);
      if (childView) {
        return p(childView);
      }

      var className = self._childViewClassName(ChildView);
      var selector = '.' + className;

      self.$('.child-views').append('<div class="settings-child-view ' + className + '"></div>');

      // Each child view receives its own model on creation. The
      // child view's model will be updated with the appropriate data
      // when shown. Sandboxed models prevent child views from sharing
      // status messages and other data with each other and the parent.
      // Without the sandbox, one child view can overwrite the model data
      // of another child view.
      var childModel = new Backbone.Model();

      // If a model was passed in, immediately copy that data to the
      // child in case the data is needed for the initial render
      if (options.model) {
        childModel.set(options.model.toJSON());
      }

      var view = self._createView(ChildView, {
        el: self.$(selector),
        model: childModel,
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

    afterRender () {
      // Initial childViews to render; excludes modal views
      var initialChildViews = this._panelViews.filter((ChildView) => {
        return ! this._isModalView(ChildView);
      });

      return p.all(initialChildViews.map((ChildView) => {
        return this._createChildViewIfNeeded(ChildView);
      }))
      .then(proto.afterRender.bind(this));
    }
  });

  module.exports = View;
});
