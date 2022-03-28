/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import MISC_DOCS from '../../docs/swagger/misc-api';
const validators = require('./validators');
const ScopeSet = require('fxa-shared/oauth/scopes');
const AppError = require('../../lib/error');
const Joi = require('joi');

const { OAUTH_SCOPE_NEWSLETTERS } = require('fxa-shared/oauth/constants');

module.exports = (log, db) => {
  return [
    {
      method: 'POST',
      path: '/newsletters',
      options: {
        ...MISC_DOCS.NEWSLETTERS_POST,
        auth: {
          strategies: ['sessionToken', 'oauthToken'],
        },
        validate: {
          payload: Joi.object({
            newsletters: validators.newsletters.required(),
          }).label('Newsletters_payload'),
        },
      },
      handler: async function (request) {
        log.begin('newsletters', request);

        const usingSessionToken = request.auth.strategy === 'sessionToken';

        if (!usingSessionToken) {
          const scope = ScopeSet.fromArray(request.auth.credentials.scope);
          if (!scope.contains(OAUTH_SCOPE_NEWSLETTERS)) {
            throw AppError.unauthorized(
              'Bearer token not authorized to update newsletters'
            );
          }
        }

        const uid = usingSessionToken
          ? request.auth.credentials.uid
          : request.auth.credentials.user;

        const { newsletters } = request.payload;
        const account = await db.account(uid);

        const geoData = request.app.geo;
        const country = geoData.location && geoData.location.country;
        const countryCode = geoData.location && geoData.location.countryCode;

        log.notifyAttachedServices('newsletters:update', request, {
          country,
          countryCode,
          email: account.primaryEmail.email,
          locale: account.locale,
          newsletters,
          uid,
          userAgent: request.headers['user-agent'],
        });

        return {};
      },
    },
  ];
};
