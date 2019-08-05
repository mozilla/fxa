/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const onHeaders = require('on-headers');
const noOp = () => {};

/**
 * Run a middleware on an HTML response.
 *
 * @param {Function} middleware middleware to run.
 * @return {Function} wrapped middleware
 */
module.exports = (middleware /*, pattern*/) => {
  return (req, res, next) => {
    onHeaders(res, () => {
      const contentType = res.getHeader('content-type') || 'html';
      if (/html/.test(contentType)) {
        // noOp is used as the "next" middleware since next
        // has already been called.
        middleware(req, res, noOp);
      }
    });

    // call next immediately so that rendering occurs
    // and the content-type set
    next();
  };
};
