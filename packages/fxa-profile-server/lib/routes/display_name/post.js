/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const db = require('../../db');
const notifyProfileUpdated = require('../../updates-queue');

const EMPTY = Object.create(null);

// We're pretty liberal with what's allowed in a display-name,
// but we exclude the following classes of characters:
//
//   \u0000-\u001F  - C0 (ascii) control characters
//   \u007F         - ascii DEL character
//   \u0080-\u009F  - C1 (ansi escape) control characters
//   \u2028-\u2029  - unicode line/paragraph separator
//   \uD800-\uDFFF  - non-BMP surrogate pairs
//   \uE000-\uF8FF  - BMP private use area
//   \uFFF9-\uFFFF  - unicode "specials" block
//
// We might tweak this list in future.

const ALLOWED_DISPLAY_NAME_CHARS = /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/;

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:display_name:write']
  },
  validate: {
    payload: {
      displayName: Joi.string().required().allow('').regex(ALLOWED_DISPLAY_NAME_CHARS)
    }
  },
  handler: function avatarPost(req, reply) {
    var uid = req.auth.credentials.user;
    var payload = req.payload;
    db.setDisplayName(uid, payload.displayName)
      .then(function () {
        notifyProfileUpdated(uid); // Don't wait on promise
        return EMPTY;
      })
      .done(reply, reply);
  }
};

