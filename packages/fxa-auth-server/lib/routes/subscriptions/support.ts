/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import zendesk from 'node-zendesk';
import pRetry from 'p-retry';

import { ConfigType } from '../../../config';
import MISC_DOCS from '../../../docs/swagger/misc-api';
import error from '../../error';
import { AuthLogger, AuthRequest } from '../../types';
import { handleAuth } from './utils';
import { email } from '../validators';
import AppError from '../../error';

export const supportRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  zendeskClient: zendesk.Client
): ServerRoute[] => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
  }

  const getAccountInfo = async (request: AuthRequest) => {
    if (request.auth.strategy === 'oauthToken') {
      return handleAuth(db, request.auth, true);
    }

    // auth stratey is supportSecret here.
    // The ticket might not be from a FxA user at all.
    const { email } = request.payload as Record<string, any>;

    try {
      const account = await db.accountRecord(email);
      return { uid: account.uid, email: account.email };
    } catch (err: any) {
      if (err.errno === AppError.ERRNO.ACCOUNT_UNKNOWN) {
        return { uid: null, email };
      }
      throw err;
    }
  };

  return [
    {
      method: 'POST',
      path: '/support/ticket',
      options: {
        ...MISC_DOCS.SUPPORT_TICKET_POST,
        auth: {
          payload: false,
          // The order here matters.  When the supportSecret strategy fails,
          // the oauthToken strategy is tried.
          strategies: ['supportSecret', 'oauthToken'],
        },
        payload: {
          maxBytes: config.support.ticketPayloadLimit,
        },
        validate: {
          payload: isA
            .object()
            .keys({
              email: email().optional(),
              productName: isA.string().required(),
              productPlatform: isA.string().optional(),
              productVersion: isA.string().optional(),
              topic: isA.string().required(),
              app: isA.string().allow('').optional(),
              subject: isA.string().allow('').optional(),
              message: isA.string().required(),
              product: isA.string().allow('').optional(),
              category: isA.string().allow('').optional(),
            })
            .label('SupportTicket_payload') as any,
        },
        response: {
          schema: isA
            .object()
            .keys({
              success: isA.bool().required(),
              ticket: isA.number().optional(),
              error: isA.string().optional(),
            })
            .label('SupportTicket_response') as any,
        },
      },
      handler: async function (
        request: AuthRequest & { payload: Record<string, any> }
      ) {
        log.begin('support.ticket', request);

        if (
          request.auth.strategy === 'supportSecret' &&
          !request.payload.email
        ) {
          throw AppError.missingRequestParameter('email');
        }

        const { uid, email } = await getAccountInfo(request);
        const { location } = request.app.geo;
        await customs.check(request, email, 'supportRequest');

        const {
          productName,
          product,
          productPlatform,
          productVersion,
          topic,
          category,
          app,
          subject: payloadSubject,
          message,
        } = request.payload;
        let subject = productName;
        if (payloadSubject) {
          subject = subject.concat(': ', payloadSubject);
        }

        const {
          productNameFieldId,
          productFieldId,
          productPlatformFieldId,
          productVersionFieldId,
          locationCityFieldId,
          locationStateFieldId,
          locationCountryFieldId,
          topicFieldId,
          categoryFieldId,
          appFieldId,
        } = config.zendesk;

        const zendeskReq: zendesk.Requests.CreatePayload = {
          request: {
            comment: { body: message },
            subject,
            requester: {
              email,
              name: email,
            },
            custom_fields: [
              { id: productNameFieldId, value: productName },
              { id: productFieldId, value: product },
              { id: productPlatformFieldId, value: productPlatform },
              { id: productVersionFieldId, value: productVersion },
              { id: topicFieldId, value: topic },
              { id: categoryFieldId, value: category },
              { id: appFieldId, value: app },
              { id: locationCityFieldId, value: location?.city },
              { id: locationStateFieldId, value: location?.state },
              { id: locationCountryFieldId, value: location?.country },
            ],
          },
        };

        let operation = 'createRequest';
        try {
          // Note that this awkward TypeScript conversion exists because the
          // typings for this client fail to accomodate using the newer Promise
          // return type.
          const createRequest = (await zendeskClient.requests.create(
            zendeskReq
          )) as unknown as zendesk.Requests.ResponseModel;

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
          const showRequest = await pRetry(async () => {
            return (await zendeskClient.users.show(
              zenUid
            )) as unknown as zendesk.Users.ResponseModel;
          }, retryOptions);
          const userFields = showRequest.user_fields as
            | null
            | undefined
            | Record<string, any>;
          if (!userFields?.user_id || !showRequest.locale) {
            operation = 'updateUser';
            await pRetry(async () => {
              return await zendeskClient.users.update(zenUid, {
                user: {
                  user_fields: { user_id: uid },
                  locale: request.app.locale,
                } as any,
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
