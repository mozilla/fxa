/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Common patterns and types used for POST data validation.
 */

const joi = require('joi');

module.exports = {
  PATTERNS: {
    BROKER: /^[0-9a-z-]+$/,
    CLIENT_ID: /^[0-9a-f]{16}/,
    CONTEXT: /^[0-9a-z_-]+$/,
    ENTRYPOINT: /^[\w.:-]+$/,
    EVENT_TYPE: /^[\w\s.:-]+$/, // the space is to allow for error contexts that contain spaces, e.g., `error.unknown context.auth.108`
    EXPERIMENT: /^[\w.-]+$/,
    MIGRATION: /^(sync11|amo|none)$/,
    SERVICE: /^(sync|content-server|none|[0-9a-f]{16})$/,
    UNIQUE_USER_ID: /^[0-9a-z-]{36}$/
  },

  TYPES: {
    BOOLEAN: joi.boolean(),
    DIMENSION: joi.number().integer().min(0),
    INTEGER: joi.number().integer(),
    OFFSET: joi.number().integer().min(0),
    REFERRER: joi.string().max(2048).uri({ scheme: [ 'android-app', 'http', 'https' ]}).allow('none'),
    STRING: joi.string().max(1024), // 1024 is arbitrary, seems like it should give CSP reports plenty of space.
    TIME: joi.number().integer().min(0),
    URL: joi.string().max(2048).uri({ scheme: [ 'http', 'https' ]}), // 2048 is also arbitrary, the same limit we use on the front end.
    UTM: joi.string().max(128).regex(/^[\w\/.%-]+/) // values here can be 'firefox/sync'
  }
};
