/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// fetch config from the backend and provide some helper functions.

'use strict';

define([
  'underscore',
  'jquery',
  'p-promise',
  'lib/url'
],
function (
  _,
  $,
  p,
  Url
) {

  function ConfigLoader() {
  }

  ConfigLoader.prototype = {
    /**
     * Pass in a configuration to use. Useful for unit testing.
     */
    useConfig: function(config) {
      this._config = config;
    },

    fetch: function (force) {
      if (force !== true && this._config) {
        return p(this._config);
      }

      var deferred = p.defer();

      // The content server sets no cookies of its own, and cannot check for
      // the existence of a session cookie. So, we send them a cookie
      // from the client to see if the backend receives it.
      // If cookies are disabled, config.cookiesEnabled will be `false`.
      //
      // A cookie is sent to the backend instead of written then immediately
      // read in JS because the Android 3.2 and 4.0 default browsers happily
      // read JS written cookies, even if cookies are disabled.
      // See https://github.com/mozilla/persona/commit/013b48c9e0bcd9e04243ea578e117537cf8aeea8

      try {
        document.cookie = '__cookie_check=1; path=/config;';
      } catch(e) {
        // some browsers explode when trying to set cookies if they are
        // disabled. Ignore the error, the server will report back that it
        // did not receive the cookie.
      }

      var self = this;
      $.getJSON('/config', function (config) {
        self._config = config;
        deferred.resolve(config);
      });

      return deferred.promise;
    },

    areCookiesEnabled: function (force) {
      return this.fetch(force)
          .then(function (config) {
            // use the search parameter for selenium testing. There is
            // no way to disable cookies using wd, so the search parameter
            // is used as a dirty hack.
            var cookiesEnabled = Url.searchParam('disable_cookies') ?
                                        false : config.cookiesEnabled;
            return cookiesEnabled;
          });
    }
  };

  return ConfigLoader;
});

