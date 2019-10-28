/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Common patterns and types used for POST data validation.
 */

const joi = require('joi');
const {
  EXPERIMENT_NAMES,
} = require('../../app/scripts/lib/experiments/grouping-rules');

const PATTERNS = {
  ACTION: /^(email|signin|signup)$/,
  ADJUST_CHANNEL_APP_ID: /^(beta|nightly|release)$/,
  BASE64: /^[A-Za-z0-9\/+]+={0,2}$/,
  BASE64_URL_SAFE: /^[A-Za-z0-9_-]+$/,
  BROKER: /^[0-9a-z-]+$/,
  CLIENT_ID: /^[0-9a-f]{16}/,
  CONTEXT: /^[0-9a-z_-]+$/,
  DOMAIN: /^[0-9A-Za-z-.]+$/,
  ENTRYPOINT: /^[\w.:-]+$/,
  EVENT_TYPE: /^[\w\s.:-]+$/, // the space is to allow for error contexts that contain spaces, e.g., `error.unknown context.auth.108`
  EXPERIMENT: /^[\w.-]+$/,
  FORM_TYPE: /^(email|other|button|subscribe)$/,
  MIGRATION: /^(sync11|amo|none)$/,
  PRODUCT_ID: /^prod_[0-9A-Za-z]+$/,
  SERVICE: /^(sync|content-server|none|[0-9a-f]{16})$/,
  SYNC_ENGINE: /^[a-z]+$/,
  UNIQUE_USER_ID: /^[0-9a-z-]{36}$/,
};

const TYPES = {
  ACTION: joi.string().regex(PATTERNS.ACTION),
  ADJUST_CHANNEL_APP_ID: joi.string().regex(PATTERNS.ADJUST_CHANNEL_APP_ID),
  BOOLEAN: joi.boolean(),
  DIMENSION: joi
    .number()
    .integer()
    .min(0),
  DOMAIN: joi
    .string()
    .max(32)
    .regex(PATTERNS.DOMAIN),
  EXPERIMENT: joi.string().valid(EXPERIMENT_NAMES),
  FLOW_ID: joi
    .string()
    .hex()
    .length(64),
  HEX32: joi.string().regex(/^[0-9a-f]{32}$/),
  INTEGER: joi.number().integer(),
  OFFSET: joi
    .number()
    .integer()
    .min(0),
  REFERRER: joi
    .string()
    .max(2048)
    .uri({ scheme: ['android-app', 'http', 'https'] })
    .allow('none'),
  RESUME: joi.string().regex(PATTERNS.BASE64),
  SIGNIN_CODE: joi
    .string()
    .regex(PATTERNS.BASE64_URL_SAFE)
    .length(8),
  STRING: joi.string().max(1024), // 1024 is arbitrary, seems like it should give CSP reports plenty of space.
  SYNC_ENGINES: joi.array().items(joi.string().regex(PATTERNS.SYNC_ENGINE)),
  TIME: joi
    .number()
    .integer()
    .min(0),
  URL: joi
    .string()
    .max(2048)
    .uri({ scheme: ['http', 'https'] }), // 2048 is also arbitrary, the same limit we use on the front end.
  USER_PREFERENCES: joi.object().keys({
    'account-recovery': joi.boolean(),
    emails: joi.boolean(),
    'two-step-authentication': joi.boolean(),
  }),
  UTM: joi
    .string()
    .max(128)
    .regex(/^[\w\/.%-]+$/), // values here can be 'firefox/sync'
};

// the crazy long allow comes from the firstrun page.
TYPES.UTM_CAMPAIGN = TYPES.UTM.allow('page+referral+-+not+part+of+a+campaign');

module.exports = {
  PATTERNS,
  TYPES,
};
