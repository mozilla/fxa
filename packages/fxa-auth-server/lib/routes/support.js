/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const ScopeSet = require('fxa-shared').oauth.scopes;

module.exports = (log, db, config, customs, zendeskClient) => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
  }

  const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
    'https://identity.mozilla.com/account/subscriptions';

  async function handleAuth(auth, fetchEmail = false) {
    const scope = ScopeSet.fromArray(auth.credentials.scope);
    if (!scope.contains(SUBSCRIPTIONS_MANAGEMENT_SCOPE)) {
      throw error.invalidScopes('Invalid authentication scope in token');
    }
    const { user: uid } = auth.credentials;
    let email;
    if (!fetchEmail) {
      ({ email } = auth.credentials);
    } else {
      const account = await db.account(uid);
      ({ email } = account.primaryEmail);
    }
    return { uid, email };
  }

  return [
    {
      method: 'POST',
      path: '/support/ticket',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: isA.object().keys({
            topic: isA.string().required(),
            subject: isA.string().optional(),
            message: isA.string().required(),
          }),
        },
        response: {
          schema: isA.object().keys({
            success: isA.bool().required(),
            ticket: isA.number().optional(),
            error: isA.string().optional(),
          }),
        },
      },
      handler: async function(request) {
        log.begin('support.ticket', request);
        const { uid, email } = await handleAuth(request.auth, true);
        await customs.check(request, email, 'supportRequest');
        let subject = request.payload.topic;
        if (request.payload.subject) {
          subject = subject.concat(': ', request.payload.subject);
        }

        try {
          const { result: createRequest } = await zendeskClient.createRequest({
            request: {
              comment: { body: request.payload.message },
              subject,
              requester: {
                email,
                name: 'Anonymous User',
              },
            },
          });

          // Ensure that the user has the appropriate custom fields
          const zenUid = createRequest.requester_id;
          const { result: showRequest } = await zendeskClient.showUser(zenUid);
          if (!showRequest.user_fields.user_id) {
            await zendeskClient.updateUser(zenUid, {
              user: { user_fields: { user_id: uid } },
            });
          }
          return { success: true, ticket: createRequest.id };
        } catch (err) {
          return { success: false, error: err.toString() };
        }
      },
    },
  ];
};
