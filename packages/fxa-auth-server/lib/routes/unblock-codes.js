/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { default as UNBLOCK_CODES_DOCS } from '../../docs/swagger/unblock-codes-api';
import { default as DESCRIPTION } from '../../docs/swagger/shared/descriptions';

import isA from 'joi';
import { schema as METRICS_CONTEXT_SCHEMA } from '../metrics/context';
import * as validators from './validators';

const { HEX_STRING, BASE_36 } = validators;

export default (log, db, mailer, config, customs) => {
  const unblockCodeLen = (config && config.codeLength) || 0;

  return [
    {
      method: 'POST',
      path: '/account/login/send_unblock_code',
      options: {
        ...UNBLOCK_CODES_DOCS.ACCOUNT_LOGIN_SEND_UNBLOCK_CODE_POST,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
      },
      handler: async function (request) {
        log.begin('Account.SendUnblockCode', request);

        const { email } = request.payload;

        request.validateMetricsContext();

        const { flowId, flowBeginTime } = await request.app.metricsContext;

        await customs.check(request, email, 'sendUnblockCode');

        const emailRecord = await db.accountRecord(email);
        const { uid } = emailRecord;

        const unblockCode = await db.createUnblockCode(uid);
        const emails = await db.accountEmails(uid);

        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendUnblockCodeEmail(emails, emailRecord, {
          acceptLanguage: request.app.acceptLanguage,
          unblockCode,
          flowId,
          flowBeginTime,
          timeZone: request.app.geo.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid,
        });

        await request.emitMetricsEvent('account.login.sentUnblockCode');

        return {};
      },
    },
    {
      method: 'POST',
      path: '/account/login/reject_unblock_code',
      options: {
        ...UNBLOCK_CODES_DOCS.ACCOUNT_LOGIN_REJECT_UNBLOCK_CODE_POST,
        validate: {
          payload: isA.object({
            uid: isA
              .string()
              .max(32)
              .regex(HEX_STRING)
              .required()
              .description(DESCRIPTION.uid),
            unblockCode: isA
              .string()
              .regex(BASE_36)
              .length(unblockCodeLen)
              .required()
              .description(DESCRIPTION.unblockCode),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Account.RejectUnblockCode', request);

        const uid = request.payload.uid;
        const code = request.payload.unblockCode.toUpperCase();

        await db.consumeUnblockCode(uid, code);
        log.info('account.login.rejectedUnblockCode', {
          uid,
          unblockCode: code,
        });
        return {};
      },
    },
  ];
};
