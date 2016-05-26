/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared utils for server-side routes to use.

module.exports = {

  // Our convention is either .html extensions or extensionless requests
  // are HTML files.  Use this function when you need to know the type of
  // the document before the response has been rendered (and hence you can't
  // just look at the Content-Type header).
  isHTMLPage: function isHTMLPage(path) {
    if (/\.html$/.test(path)) {
      return true;
    }
    if (! /\.[a-zA-Z0-9]+$/.test(path)) {
      // Some special-case routes are *not* HTML.
      if (path === '/config') {
        return false;
      }
      return true;
    }
    return false;
  }

};
