/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A channel that completes the OAuth flow using page redirects

'use strict';

define([
  'underscore',
  'lib/url',
  'lib/channels/base'
], function (_, Url, BaseChannel) {

  function noOp() {
    // it's a noOp, nothing to do.
  }

  function RedirectChannel() {
  }

  _.extend(RedirectChannel.prototype, new BaseChannel(), {
    init: function (options) {
      options = options || {};

      this._window = options.window || window;
    },

    send: function (command, data, done) {
      done = done || noOp;

      if (command === 'should_auto_complete_after_email_verification') {
        return done(null, { should_auto_complete_after_email_verification: false }); //jshint ignore: line
      } else if (command === 'oauth_complete') {
        var redirectTo = data.redirect;

        if (data.error) {
          // really, we should be parsing the URL and adding the error
          // parameter. That requires more code than this.
          var separator = redirectTo.indexOf('?') === -1 ? '?' : '&';
          redirectTo += (separator + 'error=' + encodeURIComponent(data.error));
        }

        this._window.location.href = redirectTo;
      }

      done(null);
    }
  });

  return RedirectChannel;
});
