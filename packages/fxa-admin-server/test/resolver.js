/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');

module.exports = function (path, options) {
  let result = options.defaultResolver(path, options);

  if (/^fxa-shared/.test(path)) {
    if (fs.existsSync(result + '.js')) {
      result = result + '.js';
    } else if (fs.existsSync(result + '/index.js')) {
      result = result + '/index.js';
    }
  }

  return result;
};
