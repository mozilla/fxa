/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('@hapi/joi');
const pRetry = require('p-retry');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';

async function handleAuth(db, auth) {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  if (!scope.contains(SUBSCRIPTIONS_MANAGEMENT_SCOPE)) {
    throw error.invalidScopes('Invalid authentication scope in token');
  }
  const { user: uid } = auth.credentials;

  let { email } = auth.credentials;

  if (email === undefined) {
    const account = await db.account(uid);
    ({ email } = account.primaryEmail);
  }
  return { uid, email };
}

const supportRoutes = (log, db, config, customs, zendeskClient) => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
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
            productName: isA.string().required(),
            topic: isA.string().required(),
            issue: isA.string().required(),
            subject: isA
              .string()
              .allow('')
              .optional(),
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
        const { uid, email } = await handleAuth(db, request.auth);
        const { location } = request.app.geo;
        await customs.check(request, email, 'supportRequest');
        let subject = `${request.payload.productName}`;
        if (request.payload.subject) {
          subject = subject.concat(': ', request.payload.subject);
        }
        const {
          productNameFieldId,
          locationCityFieldId,
          locationStateFieldId,
          locationCountryFieldId,
          topicFieldId,
          issueFieldId,
        } = config.zendesk;

        const zendeskReq = {
          comment: { body: request.payload.message },
          subject,
          requester: {
            email,
            name: email,
          },
          custom_fields: [
            { id: productNameFieldId, value: request.payload.productName },
            { id: topicFieldId, value: request.payload.topic },
            { id: issueFieldId, value: request.payload.issue },
            { id: locationCityFieldId, value: location.city },
            { id: locationStateFieldId, value: location.state },
            { id: locationCountryFieldId, value: location.country },
          ],
        };

        let operation = 'createRequest';
        try {
          const { result: createRequest } = await zendeskClient.createRequest({
            request: zendeskReq,
          });

          const zenUid = createRequest.requester_id;

          // 3 retries spread out over ~5 seconds
          const retryOptions = {
            retries: 3,
            minTimeout: 500,
            factor: 1.66,
          };

          // Ensure that the user has the appropriate custom fields
          // We use retries here as they're more important for linking the
          // Zendesk user to the fxa uid.
          operation = 'showUser';
          const { result: showRequest } = await pRetry(async () => {
            return await zendeskClient.showUser(zenUid);
          }, retryOptions);
          if (!showRequest.user_fields.user_id) {
            operation = 'updateUser';
            await pRetry(async () => {
              return await zendeskClient.updateUser(zenUid, {
                user: { user_fields: { user_id: uid } },
              });
            }, retryOptions);
          }
          return { success: true, ticket: createRequest.id };
        } catch (err) {
          throw error.backendServiceFailure(
            'zendesk',
            operation,
            { uid, email },
            err
          );
        }
      },
    },
  ];
};

module.exports = supportRoutes;
module.exports.handleAuth = handleAuth;
