/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');
  const BackMixin = require('views/mixins/back-mixin');
  const View = BaseView.extend({
    className: 'create_secure_password',
    template: require('stache!templates/support/create_secure_password'),
    afterRender: function () {
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
      this.window.document.cookie = 'canGoBack=1; path=' + this.window.location.pathname;
    }
  });

  require('cocktail').mixin(
    View,
    BackMixin
  );

  module.exports = View;
});
