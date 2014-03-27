/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// It's a 503 server busy response.

module.exports = function (req, res, next) {
  res.status(503);

  if (req.accepts('html')) {
    return res.render('503');
  }

  if (req.accepts('json')) {
    return res.send({ error: 'Server busy, try again soon' });
  }

  res.type('txt').send('Server busy, try again soon');
};
