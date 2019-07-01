/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

exports.getRoute = function(routes, path, method) {
  let route = null;

  routes.some(r => {
    if (r.path === path) {
      route = r;

      if (method) {
        if (r.method === method) {
          return true;
        }
        return false;
      }

      return true;
    }
  });

  return route;
};
