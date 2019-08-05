/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// It's a 404 not found response.

module.exports = function(req, res /*, next*/) {
  res.status(404);

  if (req.accepts('html')) {
    return res.send('Not found');
  }

  if (req.accepts('json')) {
    return res.send({ error: 'Not found' });
  }

  res.type('txt').send('Not found');
};
