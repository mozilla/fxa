/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The outermost view of the system. Handles window level interactions.
 */

define([
  'jquery',
  'lib/promise',
  'views/base'
], function ($, p, BaseView) {
  'use strict';

  var AppView = BaseView.extend({
    initialize: function (options) {
      options = options || {};

      this._environment = options.environment;
      this._notifications = options.notifications;

      this._notifications.on('show-view', this.showView.bind(this));
      this._notifications.on('show-sub-view', this.showSubView.bind(this));
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
     * @param {function} View - the View's constructor
     * @param {object} options - options to pass to the constructor
     */
    showView: function (View, options) {
      var self = this;

      return p().then(function () {
        var currentView = self._currentView;
        if (currentView) {
          if (currentView instanceof View) {
            // if the View to display is the same as the current view, then
            // the user is navigating from a subview back to the parent view.
            // No need to re-render, but notify interested parties of the event.
            self._notifications.trigger('navigate-from-subview', options);
            self.setTitle(currentView.titleFromView());

            return currentView;
          }

          currentView.destroy();
        }

        var viewToShow = new View(options);
        self._currentView = viewToShow;

        viewToShow.logScreen();
        return viewToShow.render()
          .then(function (isShown) {
            // render will return false if the view could not be
            // rendered for any reason, including if the view was
            // automatically redirected.
            if (! isShown) {
              viewToShow.destroy();
              self._currentView = null;

              return p(null);
            }

            self.setTitle(viewToShow.titleFromView());

            // Render the new view while stage is invisible then fade it in
            // using css animations to catch problems with an explicit
            // opacity rule after class is added.
            $('#stage').html(viewToShow.el).addClass('fade-in-forward').css('opacity', 1);
            viewToShow.afterVisible();

            // The user may be scrolled part way down the page
            // on screen transition. Force them to the top of the page.
            self.window.scrollTo(0, 0);

            $('#fox-logo').addClass('fade-in-forward').css('opacity', 1);

            self._notifications.trigger('view-shown', viewToShow);

            return viewToShow;
          });
      }).fail(function (err) {
        // uh oh, bad jiji. There was an error somewhere, send the user to
        // unexpected_error where the error will be logged.
        return self.navigate('unexpected_error', {
          error: err
        });
      });
    },

    /**
     * Show a SubView
     *
     * @param {function} SubView - constructor of subview to show.
     * @param {function} SuperView - constructor of the subview's parent.
     * @param {object} options used to create the SuperView as well as
     *        display the sub view.
     */
    showSubView: function (SubView, SuperView, options) {
      var self = this;
      // If currentView is of the SuperView type, simply show the subView
      return p().then(function () {
        if (! (self._currentView instanceof SuperView)) {
          // Create the SuperView; its initialization method should
          // handle the subView option.
          return self.showView(SuperView, options);
        }
      })
      .then(function () {
        return self._currentView.showSubView(SubView, options);
      })
      .then(function (subView) {
        // Use the super view's title as the base title
        var title = subView.titleFromView(self._currentView.titleFromView());
        self.setTitle(title);
        subView.logScreen();

        return subView;
      });
    },

    /**
     * Set the window's title
     *
     * @param {string} title
     */
    setTitle: function (title) {
      this.window.document.title = title;
    }

  });

  return AppView;
});

