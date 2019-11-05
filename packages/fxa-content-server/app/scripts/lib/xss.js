/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Basic XSS protection

import _ from 'underscore';
import Constants from './constants';

export default {
  // only allow http or https URLs, encoding the URL.
  href(text) {
    if (! _.isString(text)) {
      return;
    }

    // eslint-disable-next-line space-unary-ops
    if (!/^https?:\/\//.test(text)) {
      return;
    }

    var encodedURI = encodeURI(text);

    // All browsers have a max length of URI that they can handle.
    // IE9 has the shortest total length at 2083 bytes and 2048 characters
    // for GET requests.
    // See http://blogs.msdn.com/b/ieinternals/archive/2014/08/13/url-length-limits-in-internet-explorer.aspx

    // Check the total encoded URI length
    if (encodedURI.length > Constants.URL_MAX_LENGTH) {
      return;
    }

    return encodedURI;
  },
};
