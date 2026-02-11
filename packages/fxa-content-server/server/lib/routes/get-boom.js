/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Route to test 500 errors
module.exports = function () {
  return {
    method: 'get',
    path: '/boom',
    process: (req, res, next) => {
      next(new Error('Uh oh!'));
    },
  };
};
