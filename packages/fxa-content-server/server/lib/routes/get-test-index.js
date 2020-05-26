/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
module.exports = function (config) {
  return {
    method: 'get',
    path: '/tests/index.html',
    process: (req, res, next) => {
      const checkCoverage =
        'coverage' in req.query && req.query.coverage !== 'false';
      const coverNever = JSON.stringify(
        config.get('tests.coverage.excludeFiles')
      );

      return res.render('mocha', {
        check_coverage: checkCoverage, //eslint-disable-line camelcase
        cover_never: coverNever, //eslint-disable-line camelcase
      });
    },
  };
};
