/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// This route handler prevents REFRESH behaviour for the pairing flow
// If the user refreshes the browser during pairing, we instruct them to start over

module.exports = function() {
  // The array is converted into a RegExp
  const PAIRING_ROUTES = [
    'pair/auth/allow',
    'pair/auth/complete',
    'pair/auth/totp',
    'pair/auth/wait_for_supp',
    'pair/supp/allow',
    'pair/supp/wait_for_auth',
  ].join('|'); // prepare for use in a RegExp

  return {
    method: 'get',
    path: new RegExp('^/(' + PAIRING_ROUTES + ')/?$'),
    process: function(req, res) {
      res.redirect(302, '/pair/failure');
    },
  };
};
