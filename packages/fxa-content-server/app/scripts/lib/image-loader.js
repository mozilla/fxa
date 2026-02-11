/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A utility for pre-loading images

import _ from 'underscore';

/**
 * Returns true if given "uri" has HTTP or HTTPS scheme
 *
 * @param {String} src
 * @returns {Boolean}
 */
function load(src) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onerror = reject;
    img.onload = _.partial(resolve, img);
    img.src = src;
  });
}

export default {
  load: load,
};
