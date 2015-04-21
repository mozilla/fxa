/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'lib/xhr',
  'views/base',
  'views/mixins/back-mixin'
],
function (Cocktail, xhr, BaseView, BackMixin) {

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
        url: self.copyUrl,
        accepts: {
          text: 'text/partial'
        },
        dataType: 'text'
      })
      .then(function (template) {
        self.$('#legal-copy').html(template);
        self.$('.hidden').removeClass('hidden');

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

  return View;
});

