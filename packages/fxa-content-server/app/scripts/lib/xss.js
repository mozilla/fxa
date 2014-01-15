/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Basic XSS protection

'use strict';

define([
  'underscore',
  'processed/constants'
],
function(_, Constants) {
  return {
    // only allow http or https URLs, encoding the URL.
    href: function(text) {
      if (! _.isString(text)) {
        return;
      }

      if (! /^https?:\/\//.test(text)) {
        return;
      }

      var encodedURI = encodeURI(text);

      // All browsers have a max length of URI that they can handle.
      // IE8 has the shortest total length at 2083 bytes and 2048 characters
      // for GET requests.
      // See http://support.microsoft.com/kb/q208427

      // Check the total encoded URI length
      if (encodedURI.length > Constants.URL_MAX_LENGTH) {
        return;
      }

      return encodedURI;
    }
  };
});


