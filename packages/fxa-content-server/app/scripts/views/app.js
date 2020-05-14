/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The outermost view of the system. Handles window level interactions.
 */

import $ from 'jquery';
import Backbone from 'backbone';
import BaseView from './base';
import Cocktail from 'cocktail';
import KeyCodes from '../lib/key-codes';
import LoadingMixin from './mixins/loading-mixin';

var AppView = BaseView.extend({
  initialize(options) {
    options = options || {};

    this._surveyTargeter = options.surveyTargeter;
    this._environment = options.environment;
    this._createView = options.createView;
  },

  notifications: {
    'show-child-view': 'showChildView',
    'show-view': 'showView',
  },

  events: {
    'click a[href^="/"]': 'onAnchorClick',
    keyup: 'onKeyUp',
  },

  onKeyUp(event) {
    // Global listener for keyboard events. This is
    // useful for cases where the view has lost focus
    // but you still want to perform an action on that view.

    // Handle user pressing `ESC`
    if (event.which === KeyCodes.ESCAPE) {
      // Pressing ESC when any modal is visible should close the modal.
      if ($.modal.isActive()) {
        $.modal.close();
      } else if (event.currentTarget.className.indexOf('settings') >= 0) {
        // If event came from any settings view, close all panels and
        // goto base settings view.
        $('.settings-unit').removeClass('open');
        this.navigate('settings');
      }
    }
  },

  onAnchorClick(event) {
    // if someone killed this event, or the user is holding a modifier
    // key, ignore the event.
    if (
      event.isDefaultPrevented() ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    // Remove leading slashes
    const url = $(event.currentTarget)
      .attr('href')
      .replace(/^\//, '');
    this.navigate(url);
  },

  _currentView: null,

  /**
   * Show a View. If the view is already displayed the view is not
   * re-rendered. If the view is not displayed, the current view is
   * replaced.
   *
   * @param {Function} View - the View's constructor
   * @param {Object} [options] - options to pass to the constructor
   * @param {boolean} [options.force] - specify if the view must be forced to render
   *
   * @returns {Promise}
   */
  showView(View, options = {}) {
    return Promise.resolve()
      .then(() => {
        options.model = options.model || new Backbone.Model();

        var currentView = this._currentView;
        if (currentView instanceof View && options.force !== true) {
          // child view->parent view
          //
          // No need to re-render, only notify parties of the event.
          // update the current view's model with data sent from
          // the child view.
          currentView.model.set(options.model.toJSON());

          this.notifier.trigger('navigate-from-child-view', options);
          this.setTitle(currentView.titleFromView());

          return currentView;
        } else if (currentView) {
          currentView.destroy();
        }

        var viewToShow = this._createView(View, options);
        this._currentView = viewToShow;

        return viewToShow.render().then(isShown => {
          // render will return false if the view could not be
          // rendered for any reason, including if the view was
          // automatically redirected.
          if (!isShown) {
            viewToShow.destroy();

            // If viewToShow calls `navigate` in its `beforeRender` function,
            // the new view will be created and this._currentView will
            // reference the second view before the first view's render
            // promise chain completes. Ensure this._currentView is the same
            // as viewToShow before destroying the reference. Ref #3187
            if (viewToShow === this._currentView) {
              this._currentView = null;
            }

            return Promise.resolve(null);
          }

          this.setTitle(viewToShow.titleFromView());

          this._showSurvey(viewToShow, options);

          this.writeToDOM(viewToShow.el);

          // logView is done outside of the view itself because the settings
          // page renders many child views at once. If the view took care of
          // logging itself, each child view would be logged at the same time.
          // We only want to log the screen being displayed, child views will
          // be logged when they are opened.
          viewToShow.logView();

          viewToShow.afterVisible();

          this.notifier.trigger('view-shown', viewToShow);

          return viewToShow;
        });
      })
      .catch(this.fatalError.bind(this));
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
  showChildView(ChildView, ParentView, options) {
    // If currentView is of the ParentView type, simply show the subView
    return Promise.resolve()
      .then(() => {
        if (!(this._currentView instanceof ParentView)) {
          // Create the ParentView; its initialization method should
          // handle the childView option.
          return this.showView(ParentView, options);
        }
      })
      .then(() => this._currentView.showChildView(ChildView, options))
      .then(childView => {
        // Use the super view's title as the base title
        var title = childView.titleFromView(this._currentView.titleFromView());
        this.setTitle(title);
        childView.logView();

        // The child view has its own model. Import the passed in
        // model data to the child's model and display any
        // necessary status messages.
        childView.model.set(options.model.toJSON());
        childView.displayStatusMessages();

        this._showSurvey(this._currentView, options);

        return childView;
      });
  },

  /**
   * Get a survey from the survey targeting module.  If there's a survey,
   * append it to the view.
   *
   * @param {Backbone.View} view the current (parent) view
   * @param {Object} options the option for the view to be displayed
   */
  _showSurvey(view, options) {
    const survey =
      this._surveyTargeter && this._surveyTargeter.getSurvey(options.viewName);

    if (survey) {
      survey.render();
      view.$el.append(survey.el);
    }
  },

  /**
   * Set the window's title
   *
   * @param {String} title
   */
  setTitle(title) {
    this.window.document.title = title;
  },
});

Cocktail.mixin(AppView, LoadingMixin);

export default AppView;
