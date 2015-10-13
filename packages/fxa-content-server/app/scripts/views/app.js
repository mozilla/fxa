/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The outermost view of the system. Handles window level interactions.
 */

define([
  'views/base'
], function (BaseView) {
  'use strict';

  var AppView = BaseView.extend({
    el: 'body',

    initialize: function (options) {
      options = options || {};

      this._environment = options.environment;
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

      // Instruct Backbone to trigger routing events
      this.navigate(url);
    }
  });

  return AppView;
});

