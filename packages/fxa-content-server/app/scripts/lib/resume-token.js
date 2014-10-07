/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * stringify and parse the `resume` token that is set in the URL
 * search parameters post-verification in the OAuth flow
 */
'use strict';

define([], function () {
  var ResumeToken = {
    parse: function (resumeToken) {
      try {
        return JSON.parse(atob(resumeToken));
      } catch(e) {
        // do nothing, its an invalid token.
      }
    },

    stringify: function (resumeObj) {
      var encoded = btoa(JSON.stringify(resumeObj));
      return encoded;
    }
  };

  return ResumeToken;
});



