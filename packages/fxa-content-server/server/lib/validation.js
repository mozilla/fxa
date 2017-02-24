/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Common patterns and types used for POST data validation.
 */

const joi = require('joi');

module.exports = {
  TYPES: {
    INTEGER: joi.number().integer(),
    STRING: joi.string().max(1024), // 1024 is arbitrary, seems like it should give CSP reports plenty of space.
    URL: joi.string().max(2048).uri({ scheme: [ 'http', 'https' ]}) // 2048 is also arbitrary, the same limit we use on the front end.
  }
};
