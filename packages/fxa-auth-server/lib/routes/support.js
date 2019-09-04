/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;

module.exports = (log, db, config, customs, zendeskClient, subhub) => {
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

  /**
   * Looking up the product name here on the server side will save us a couple
   * of requests from the client: 1) fetch an oauth token, and 2) use the token
   * get the plans. The plans are cached in Redis, so fetching them here should
   * be quick.
   */
  async function getProductName(planId) {
    const productNamePrefix = 'FxA - ';
    const productNameDefault = 'Other';
    const productNameDefaultUpperCase = 'OTHER';
    const defaultProductName = `${productNamePrefix}${productNameDefault}`;

    // "Other" was selected on the support form
    if (planId.toUpperCase() === productNameDefaultUpperCase) {
      return defaultProductName;
    }

    const plans = await subhub.listPlans();
    const plan = plans.find(p => p.plan_id === planId);

    return plan
      ? `${productNamePrefix}${plan.product_name}`
      : defaultProductName;
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
            plan: isA.string().required(),
            planId: isA.string().required(),
            topic: isA.string().required(),
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
        const { uid, email } = await handleAuth(request.auth, true);
        await customs.check(request, email, 'supportRequest');
        let subject = `${request.payload.topic} for ${request.payload.plan}`;
        if (request.payload.subject) {
          subject = subject.concat(': ', request.payload.subject);
        }

        const zendeskReq = {
          comment: { body: request.payload.message },
          subject,
          requester: {
            email,
            name: 'Anonymous User',
          },
        };
        zendeskReq[config.zendesk.productNameFieldId] = await getProductName(
          request.payload.planId
        );

        try {
          const { result: createRequest } = await zendeskClient.createRequest({
            request: zendeskReq,
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
