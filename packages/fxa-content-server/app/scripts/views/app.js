/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The outermost view of the system. Handles window level interactions.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Backbone = require('backbone');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var LoadingMixin = require('views/mixins/loading-mixin');
  var p = require('lib/promise');

  var AppView = BaseView.extend({
    initialize: function (options) {
      options = options || {};

      this._environment = options.environment;
      this._createView = options.createView;
    },

    notifications: {
      'show-child-view': 'showChildView',
      'show-view': 'showView'
    },

    events: {
      'click a[href^="/"]': 'onAnchorClick'
    },

    onAnchorClick: function (event) {
      // if someone killed this event, or the user is holding a modifier
      // key, ignore the event.
      if (event.isDefaultPrevented() ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey) {
        return;
      }

      event.preventDefault();

      // Remove leading slashes
      var url = $(event.currentTarget).attr('href').replace(/^\//, '');
      if (this._environment.isFramed() && url.indexOf('legal') > -1) {
        this.window.open(url, '_blank');
        return;
      }

      this.navigate(url);
    },

    _currentView: null,

    /**
     * Show a View. If the view is already displayed the view is not
     * re-rendered. If the view is not displayed, the current view is
     * replaced.
     *
     * @param {Function} View - the View's constructor
     * @param {Object} options - options to pass to the constructor
     *
     * @returns {Promise}
     */
    showView: function (View, options) {
      var self = this;

      return p().then(function () {
        options.model = options.model || new Backbone.Model();

        var currentView = self._currentView;
        if (currentView instanceof View) {
          // child view->parent view
          //
          // No need to re-render, only notify parties of the event.
          // update the current view's model with data sent from
          // the child view.
          currentView.model.set(options.model.toJSON());

          self.notifier.trigger('navigate-from-child-view', options);
          self.setTitle(currentView.titleFromView());

          return currentView;
        } else if (currentView) {
          currentView.destroy();
        }

        var viewToShow = self._createView(View, options);
        self._currentView = viewToShow;

        viewToShow.logView();
        return viewToShow.render()
          .then(function (isShown) {
            // render will return false if the view could not be
            // rendered for any reason, including if the view was
            // automatically redirected.
            if (! isShown) {
              viewToShow.destroy();

              // If viewToShow calls `navigate` in its `beforeRender` function,
              // the new view will be created and self._currentView will
              // reference the second view before the first view's render
              // promise chain completes. Ensure self._currentView is the same
              // as viewToShow before destroying the reference. Ref #3187
              if (viewToShow === self._currentView) {
                self._currentView = null;
              }

              return p(null);
            }

            self.setTitle(viewToShow.titleFromView());

            self.writeToDOM(viewToShow.el);

            viewToShow.afterVisible();

            self.notifier.trigger('view-shown', viewToShow);

            return viewToShow;
          });
      }).fail(self.fatalError.bind(self));
    },

    /**
     * Show a ChildView
     *
     * @param {Function} ChildView - constructor of childView to show.
     * @param {Function} ParentView - constructor of the childView's parent.
     * @param {Object} options used to create the ParentView as well as
     *        display the child view.
     *
     * @returns {Promise}
     */
    showChildView: function (ChildView, ParentView, options) {
      var self = this;
      // If currentView is of the ParentView type, simply show the subView
      return p().then(function () {
        if (! (self._currentView instanceof ParentView)) {
          // Create the ParentView; its initialization method should
          // handle the childView option.
          return self.showView(ParentView, options);
        }
      })
      .then(function () {
        return self._currentView.showChildView(ChildView, options);
      })
      .then(function (childView) {
        // Use the super view's title as the base title
        var title = childView.titleFromView(self._currentView.titleFromView());
        self.setTitle(title);
        childView.logView();

        // The child view has its own model. Import the passed in
        // model data to the child's model and display any
        // necessary status messages.
        childView.model.set(options.model.toJSON());
        childView.displayStatusMessages();

        return childView;
      });
    },

    /**
     * Set the window's title
     *
     * @param {String} title
     */
    setTitle: function (title) {
      this.window.document.title = title;
    }

  });

  Cocktail.mixin(
    AppView,
    LoadingMixin
  );

  module.exports = AppView;
});

