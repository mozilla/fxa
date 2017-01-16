/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirects a versioned route to an unversioned route.
 */
module.exports = function (path) {
  var VERSION_PREFIX = '/v1';
  var VERSION_PREFIX_REGEXP = new RegExp('^' + VERSION_PREFIX);

  function removeVersionPrefix(versionedUrl) {
    return versionedUrl.replace(VERSION_PREFIX_REGEXP, '');
  }

  return {
    method: 'get',
    path: VERSION_PREFIX + '/' + path,
    process: (req, res, next) => {
      res.redirect(removeVersionPrefix(req.originalUrl));
    }
  };
};
