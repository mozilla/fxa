/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This component renders multiple childViews
import Backbone from 'backbone';
import BaseView from './base';
import Logger from '../lib/logger';
import Template from 'templates/sub_panels.mustache';

const proto = BaseView.prototype;
const View = BaseView.extend({
  template: Template,
  className: 'sub-panels',

  initialize(options) {
    options = options || {};

    this._panelViews = options.panelViews || [];
    this._parent = options.parent;
    this._createView = options.createView;
    this._logger = new Logger();
  },

  showChildView(ChildView, options) {
    if (this._panelViews.indexOf(ChildView) === -1) {
      this._logger.warn('Tried to show a view that is not a subpanel');
      return Promise.resolve(null);
    }

    return this._createChildViewIfNeeded(ChildView, options).then(
      (childView) => {
        if (childView) {
          this._currentChildView = childView;
          childView.openPanel();

          return childView;
        }
      }
    );
  },

  _childViewInstanceFromClass(ChildView) {
    return this.childViews.filter(function (childView) {
      if (childView instanceof ChildView) {
        return true;
      }
    })[0];
  },

  _isModalView(ChildView) {
    return !!ChildView.prototype.isModal;
  },

  _childViewClassName(ChildView) {
    return ChildView.prototype.className;
  },

  // Render childView if an instance doesn't already exist
  _createChildViewIfNeeded(ChildView, options) {
    options = options || {};

    var childView = this._childViewInstanceFromClass(ChildView);
    if (childView) {
      return Promise.resolve(childView);
    }

    var className = this._childViewClassName(ChildView);
    var selector = '.' + className;

    this.$('.child-views').append(
      '<div class="settings-child-view ' + className + '"></div>'
    );

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

    var view = this._createView(ChildView, {
      el: this.$(selector),
      model: childModel,
      parentView: this._parent,
    });

    this.trackChildView(view);

    return this.renderChildView(view);
  },

  renderChildView(viewToShow) {
    return viewToShow.render().then(function (shown) {
      if (!shown) {
        viewToShow.destroy(true);
        return;
      }

      viewToShow.afterVisible();

      return viewToShow;
    });
  },

  afterRender() {
    // Initial childViews to render; excludes modal views
    var initialChildViews = this._panelViews.filter((ChildView) => {
      return !this._isModalView(ChildView);
    });

    return Promise.all(
      initialChildViews.map((ChildView) => {
        return this._createChildViewIfNeeded(ChildView);
      })
    ).then(proto.afterRender.bind(this));
  },
});

export default View;
