/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var xhr = require('lib/xhr');

  // A view to fetch and render legal copy. Sub-classes must provide
  // a `copyUrl` where the copy template can be fetched, as well a
  // `fetchError`, which is an error to display if there is a
  // problem fetching the copy template.

  var View = BaseView.extend({
    initialize: function (options) {
      this._xhr = options.xhr || xhr;
    },

    afterRender: function () {
      var self = this;
      return self._xhr.ajax({
        accepts: { text: 'text/partial' },
        dataType: 'text',
        url: self.copyUrl
      })
      .then(function (template) {
        var $legalCopy = self.$('#legal-copy');

        $legalCopy.html(template);

        // data-visible-url is used to display the href in
        // brackets next to the original text.
        // Only show the href if the href is different from
        // the text. See #2225.
        //
        // Links are only made visible from the main app. If
        // the user browses directly to a TOS/PP page, the links
        // are normal.
        self.$el.addClass('show-visible-url');
        self.$('a').each(function (index, element) {
          element = $(element);

          var href = element.attr('href');
          var text = element.text();
          // if the href is the same as the link text, don't convert.
          if (href && href !== text) {
            element.attr('data-visible-url', href);
          }
        });

        self.$('.hidden').removeClass('hidden');

        // The `data-shown` attribute is searched for by the functional
        // tests. The legal copy HTML has unstable markup, so the functional
        // tests need some stable identifier to look for to know the copy is
        // ready.
        $legalCopy.attr('data-shown', 'true');

        // Set a session cookie that informs the server
        // the user can go back if they refresh the page.
        // If the user can go back, the browser will not
        // render the statically generated TOS/PP page,
        // but will let the app render the page.
        // The cookie is cleared whenever the user
        // restarts the browser. See #2044
        //
        // The cookie is scoped to the page to avoid sending
        // it on other requests, and to ensure the server
        // only sends the user back to the app if the user in fact
        // came from this page.
        self.window.document.cookie = 'canGoBack=1; path=' + self.window.location.pathname;
      })
      .fail(function () {
        self.displayError(self.fetchError);
        self.$('.hidden').removeClass('hidden');
      });
    }
  });

  Cocktail.mixin(
    View,
    BackMixin
  );

  module.exports = View;
});

