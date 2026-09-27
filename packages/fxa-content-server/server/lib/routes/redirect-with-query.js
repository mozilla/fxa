/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirects a retired route to another route, keeping the query string.
 */

'use strict';
module.exports = function (fromPath, toPath) {
  return {
    method: 'get',
    path: '/' + fromPath,
    process: (req, res) => {
      const queryIndex = req.originalUrl.indexOf('?');
      const query = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
      res.redirect('/' + toPath + query);
    },
  };
};
