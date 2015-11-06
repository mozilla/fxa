/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Display a loading screen on view initialization until
 * the View's normal template is rendered.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var loadingTemplate = require('stache!templates/loading');

  module.exports = {
    initialize: function () {
      var self = this;
      var loadingHTML = loadingTemplate({});

      // TODO - The next three lines are copied from router.js.
      // It would be nice to consolidate, but that would add even more
      // code to this PR. Perhaps use a `visible` event or something
      // like that the router can listen for.

      // note - the loadingHTML is written directly into #stage instead
      // of this.$el because overwriting this.$el has a nasty side effect
      // where the view's DOM event handlers do hook up properly.
      $('#stage').html(loadingHTML).addClass('fade-in-forward').css('opacity', 1);

      // The user may be scrolled part way down the page
      // on view transition. Force them to the top of the page.
      self.window.scrollTo(0, 0);

      $('#fox-logo').addClass('fade-in-forward').css('opacity', 1);
    }
  };
});

