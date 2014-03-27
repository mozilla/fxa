/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// It's a 500 system unavailable response.

module.exports = function (req, res, next) {
  res.status(500);

  if (req.accepts('html')) {
    return res.render('500');
  }

  if (req.accepts('json')) {
    return res.send({ error: 'System unavailable, try again soon' });
  }

  res.type('txt').send('System unavailable, try again soon');
};
