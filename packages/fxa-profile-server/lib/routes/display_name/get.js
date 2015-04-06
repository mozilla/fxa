/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const checksum = require('checksum');

const AppError = require('../../error');
const db = require('../../db');

function displayNameResult(result) {
  if (result && result.displayName) {
    return {
      displayName: result.displayName
    };
  }
  throw AppError.notFound();
}

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:display_name']
  },
  response: {
    schema: {
      displayName: Joi.string().max(256)
    }
  },
  handler: function avatar(req, reply) {
    db.getDisplayName(req.auth.credentials.user)
      .then(displayNameResult)
      .done(function (result) {
        return reply(result).etag(checksum(result.displayName));
      }, reply);
  }
};

