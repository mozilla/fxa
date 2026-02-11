/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
module.exports = function (config) {
  const STATIC_RESOURCE_URL = config.get('static_resource_url');

  return {
    method: 'get',
    path: '/503.html',
    process: (req, res, next) => {
      res.render('503', { staticResourceUrl: STATIC_RESOURCE_URL });
    },
  };
};
