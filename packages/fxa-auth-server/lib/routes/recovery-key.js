/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const RECOVERY_KEY_DOCS =
  require('../../docs/swagger/recovery-key-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;

const AppError = require('../error');
const errors = require('../error');
const { recordSecurityEvent } = require('./utils/security-event');
const validators = require('./validators');
const isA = require('joi');
const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const { list } = require('../oauth/authorized_clients');

module.exports = (
  log,
  db,
  Password,
  verifierVersion,
  customs,
  mailer,
  glean
) => {
  return [
    {
      method: 'POST',
      path: '/recoveryKey',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            recoveryKeyId: validators.recoveryKeyId.description(
              DESCRIPTION.recoveryKeyId
            ),
            recoveryData: validators.recoveryData.description(
              DESCRIPTION.recoveryData
            ),
            enabled: isA.boolean().default(true),
            replaceKey: isA.boolean().default(false),
          }),
        },
      },
      handler: async function (request) {
        log.begin('createRecoveryKey', request);

        const sessionToken = request.auth.credentials;

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        const { uid } = sessionToken;
        const { recoveryKeyId, recoveryData, enabled, replaceKey } =
          request.payload;

        async function sendKeyCreationEmail() {
          const account = await db.account(uid);
          const { acceptLanguage, clientAddress: geo, ua } = request.app;
          const emailOptions = {
            acceptLanguage,
            timeZone: geo.timeZone,
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uid,
          };
          await mailer.sendPostAddAccountRecoveryEmail(
            account.emails,
            account,
            emailOptions
          );
        }

        async function sendKeyChangeEmail() {
          const account = await db.account(uid);
          const { acceptLanguage, clientAddress: geo, ua } = request.app;
          const emailOptions = {
            acceptLanguage,
            timeZone: geo.timeZone,
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uid,
          };
          await mailer.sendPostChangeAccountRecoveryEmail(
            account.emails,
            account,
            emailOptions
          );
        }

        async function postKeyCreation() {
          log.info('account.recoveryKey.created', { uid });

          if (enabled) {
            await request.emitMetricsEvent('recoveryKey.created', { uid });
            recordSecurityEvent('account.recovery_key_added', {
              db,
              request,
              account: { uid },
            });
            sendKeyCreationEmail();
          }
        }

        async function postKeyChange() {
          log.info('account.recoveryKey.changed', { uid });
          if (enabled) {
            await request.emitMetricsEvent('recoveryKey.changed', { uid });
            recordSecurityEvent('account.recovery_key_removed', {
              db,
              request,
            });
            recordSecurityEvent('account.recovery_key_added', {
              db,
              request,
              account: { uid },
            });
            sendKeyChangeEmail();
          }
        }

        async function attemptKeyChange() {
          await db.deleteRecoveryKey(uid);
          await db.createRecoveryKey(uid, recoveryKeyId, recoveryData, enabled);
          postKeyChange();
        }

        try {
          // `recoveryKeyExists` will return true if and only if there is an *enabled* recovery
          // key. In other scenarios a user started creating one but never completed the enable
          // process.
          const enabledKey = await db.recoveryKeyExists(uid);

          if (enabledKey.exists && replaceKey === true) {
            // if we are explicitly requesting a key change
            // delete the key and create a new one
            await attemptKeyChange();
            // if we are not explicitly requesting a key change
            // but an enabled key exists, throw an error
          } else if (enabledKey.exists && replaceKey !== true) {
            throw AppError.recoveryKeyExists();
          } else {
            // if no key is enabled, attempt to create a new key
            await db.createRecoveryKey(
              uid,
              recoveryKeyId,
              recoveryData,
              enabled
            );
            postKeyCreation();
          }
        } catch (err) {
          // `recoveryKeyExists` will return true if and only if there is an *enabled* recovery
          // key. In other scenarios a user started creating one but never completed the enable
          // process.
          const enabledKey = await db.recoveryKeyExists(uid);

          // throw for all errors except recovery key exists
          if (err.errno !== errors.ERRNO.RECOVERY_KEY_EXISTS) {
            throw err;
          } else if (!enabledKey.exists) {
            // if a recovery key exists but it is not enabled,
            // attempt to change it
            await attemptKeyChange();
          } else {
            // if a key is already enabled and we don't intend to replace it
            // reject the request
            throw err;
          }
        }
        return {};
      },
    },
    {
      method: 'POST',
      path: '/recoveryKey/verify',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_VERIFY_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: {
            recoveryKeyId: validators.recoveryKeyId,
          },
        },
      },
      handler: async function (request) {
        log.begin('verifyRecoveryKey', request);

        const sessionToken = request.auth.credentials;
        const { uid } = sessionToken;

        try {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession();
          }

          // This route can let you check if a key is valid therefore we
          // rate limit it.
          await customs.checkAuthenticated(request, uid, 'getRecoveryKey');

          const { recoveryKeyId } = request.payload;

          // Attempt to retrieve an account recovery key, if it exists and is not already enabled,
          // then we enable it.
          const recoveryKeyData = await db.getRecoveryKey(uid, recoveryKeyId);

          if (!recoveryKeyData.enabled) {
            await db.updateRecoveryKey(uid, recoveryKeyId, true);

            await request.emitMetricsEvent('recoveryKey.created', { uid });

            const account = await db.account(uid);
            const { acceptLanguage, clientAddress: geo, ua } = request.app;
            const emailOptions = {
              acceptLanguage,
              timeZone: geo.timeZone,
              uaBrowser: ua.browser,
              uaBrowserVersion: ua.browserVersion,
              uaOS: ua.os,
              uaOSVersion: ua.osVersion,
              uaDeviceType: ua.deviceType,
              uid,
            };

            await mailer.sendPostAddAccountRecoveryEmail(
              account.emails,
              account,
              emailOptions
            );
          }
          recordSecurityEvent('account.recovery_key_challenge_success', {
            db,
            request,
            account: { uid },
          });
        } catch (err) {
          recordSecurityEvent('account.recovery_key_challenge_failure', {
            db,
            request,
            account: { uid },
          });
          throw err;
        }

        return {};
      },
    },
    {
      method: 'GET',
      path: '/recoveryKey/{recoveryKeyId}',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_RECOVERYKEYID_GET,
        auth: {
          strategy: 'accountResetToken',
        },
        validate: {
          params: isA.object({
            recoveryKeyId: validators.recoveryKeyId,
          }),
        },
      },
      handler: async function (request) {
        log.begin('getRecoveryKey', request);

        const { uid } = request.auth.credentials;
        const { recoveryKeyId } = request.params;

        await customs.checkAuthenticated(request, uid, 'getRecoveryKey');

        const { recoveryData } = await db.getRecoveryKey(uid, recoveryKeyId);

        glean.resetPassword.recoveryKeySuccess(request, { uid });

        return { recoveryData };
      },
    },
    {
      method: 'POST',
      path: '/recoveryKey/exists',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_EXISTS_POST,
        auth: {
          strategies: [
            'multiStrategySessionToken',
            'multiStrategyPasswordForgotToken',
          ],
        },
        validate: {
          payload: isA
            .object({
              email: validators.email().optional(),
            })
            .optional()
            .allow(null),
        },
        response: {
          schema: isA.object({
            exists: isA.boolean().required(),
            hint: isA.string().optional().allow(null),
            estimatedSyncDeviceCount: isA.number().optional(),
          }),
        },
      },
      async handler(request) {
        log.begin('recoveryKeyExists', request);

        const uid = request.auth.credentials.uid;
        const recoveryKeyRecordWithHint = await db.getRecoveryKeyRecordWithHint(
          uid
        );

        // We try our best to estimate the number of Sync devices that could be impacted by using a recovery key.
        // It is an estimate because we currently can't query the Sync service to get the actual number of items
        // until https://mozilla-hub.atlassian.net/browse/SYNC-4240 is implemented.
        const services = await list(uid);
        const estimatedSyncDeviceCount = Math.max(
          (await db.devices(uid)).length,
          services.filter((service) =>
            service.scope.includes(OAUTH_SCOPE_OLD_SYNC)
          ).length
        );

        return {
          exists: !!recoveryKeyRecordWithHint,
          hint: recoveryKeyRecordWithHint?.hint,
          estimatedSyncDeviceCount,
        };
      },
    },
    {
      method: 'POST',
      path: '/recoveryKey/hint',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_HINT_POST,
        auth: {
          // hint update is only possible when authenticated
          // from /settings or (eventually) after signup, signin or successful password reset
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            hint: validators.recoveryKeyHint.description(
              DESCRIPTION.recoveryKeyHint
            ),
          }),
        },
      },
      handler: async function (request) {
        log.begin('updateRecoveryKeyHint', request);

        const { uid, tokenVerificationId } = request.auth.credentials;

        const { hint } = request.payload;

        if (tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        const keyForUid = await db.recoveryKeyExists(uid);

        if (!keyForUid.exists) {
          throw errors.recoveryKeyNotFound();
        }

        await db.updateRecoveryKeyHint(uid, hint);

        return {};
      },
    },
    {
      method: 'DELETE',
      path: '/recoveryKey',
      options: {
        ...RECOVERY_KEY_DOCS.RECOVERYKEY_DELETE,
        auth: {
          strategy: 'sessionToken',
        },
      },
      async handler(request) {
        log.begin('recoveryKeyDelete', request);

        const { tokenVerificationId, uid } = request.auth.credentials;

        if (tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        await db.deleteRecoveryKey(uid);
        recordSecurityEvent('account.recovery_key_removed', { db, request });

        const account = await db.account(uid);

        const { acceptLanguage, clientAddress: geo, ua } = request.app;
        const emailOptions = {
          acceptLanguage,
          timeZone: geo.timeZone,
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uid,
        };

        await mailer.sendPostRemoveAccountRecoveryEmail(
          account.emails,
          account,
          emailOptions
        );

        return {};
      },
    },
  ];
};
