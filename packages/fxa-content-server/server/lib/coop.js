/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to always set Cross-Origin-Opener-Policy

'use strict';
const helmet = require('helmet');
const htmlOnly = require('./html-middleware');

module.exports = function () {
  const coopMiddleware = helmet.crossOriginOpenerPolicy({
    policy: 'same-origin',
  });

  return htmlOnly((req, res, next) => {
    coopMiddleware(req, res, next);
  });
};
