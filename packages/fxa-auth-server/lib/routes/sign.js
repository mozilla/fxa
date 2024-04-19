/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const validators = require('./validators');
const SIGN_DOCS = require('../../docs/swagger/sign-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;
const crypto = require('crypto');

module.exports = (log, signer, db, domain, devices, config) => {
  const HOUR = 1000 * 60 * 60;

  const rolloutRate = config.certificateSignDisableRolloutRate || 0;
  // This determines if the certificate signing endpoint is disabled for a user.
  // It is based on `BaseGroupingRule` from `fxa-content-server/app/scripts/lib/experiments/grouping-rules/base.js`
  function isDisabledForUser(value) {
    // Generate hash of a constant value of the user (email, uid, etc)
    const hash = crypto.createHash('sha256').update(value).digest('hex');

    // Convert the hash to a number between 0 and 1
    const maxHash = parseInt('f'.repeat(hash.length), 16);
    const hashNum = parseInt(hash, 16);
    const luckyNumber = hashNum / maxHash;

    return luckyNumber < rolloutRate;
  }

  const routes = [
    {
      method: 'POST',
      path: '/certificate/sign',
      options: {
        ...SIGN_DOCS.CERTIFICATE_SIGN_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            service: validators.service.optional(),
          }),
          payload: isA.object({
            publicKey: isA
              .object({
                algorithm: isA.string().valid('RS', 'DS').required(),
                n: isA.string(),
                e: isA.string(),
                y: isA.string(),
                p: isA.string(),
                q: isA.string(),
                g: isA.string(),
                version: isA.string(),
              })
              .required()
              .description(DESCRIPTION.publicKey),
            duration: isA
              .number()
              .integer()
              .min(0)
              .max(24 * HOUR)
              .required()
              .description(DESCRIPTION.duration),
          }),
        },
      },
      handler: async function certificateSign(request) {
        log.begin('Sign.cert', request);
        const sessionToken = request.auth.credentials;

        if (isDisabledForUser(sessionToken.email)) {
          throw error.goneFourOhFour();
        }

        const publicKey = request.payload.publicKey;
        const duration = request.payload.duration;
        // This is a legacy endpoint that's typically only used by
        // clients connected to sync, so assume `service=sync` for
        // metrics logging purposes unless we're told otherwise.
        if (!request.query.service) {
          request.query.service = 'sync';
        }
        let deviceId;
        if (request.headers['user-agent']) {
          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
            formFactor: uaFormFactor,
          } = request.app.ua;
          sessionToken.setUserAgentInfo({
            uaBrowser,
            uaBrowserVersion,
            uaOS,
            uaOSVersion,
            uaDeviceType,
            uaFormFactor,
            lastAccessTime: Date.now(),
          });
          // No need to wait for a response, update in the background.
          db.touchSessionToken(sessionToken, request.app.geo);
        } else {
          log.warn('signer.updateSessionToken', {
            message: 'no user agent string, session token not updated',
          });
        }

        if (!sessionToken.emailVerified) {
          throw error.unverifiedAccount();
        }
        if (sessionToken.mustVerify && !sessionToken.tokenVerified) {
          throw error.unverifiedSession();
        }

        if (sessionToken.deviceId) {
          deviceId = sessionToken.deviceId;
        } else {
          // Synthesize a device record for browser sessions that don't already have one.
          // Include the UA info so that we can synthesize a device name
          // for any push notifications.
          const deviceInfo = {
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
          };
          try {
            const result = await devices.upsert(
              request,
              sessionToken,
              deviceInfo
            );
            deviceId = result.id;
          } catch (err) {
            // There's a small chance that a device registration was performed
            // concurrently.  If so, just use that device id.
            if (err.errno !== error.ERRNO.DEVICE_CONFLICT) {
              throw err;
            }
            deviceId = err.output.payload.deviceId;
          }
        }

        if (publicKey.algorithm === 'RS') {
          if (!publicKey.n) {
            throw error.missingRequestParameter('n');
          }
          if (!publicKey.e) {
            throw error.missingRequestParameter('e');
          }
        } else {
          // DS
          if (!publicKey.y) {
            throw error.missingRequestParameter('y');
          }
          if (!publicKey.p) {
            throw error.missingRequestParameter('p');
          }
          if (!publicKey.q) {
            throw error.missingRequestParameter('q');
          }
          if (!publicKey.g) {
            throw error.missingRequestParameter('g');
          }
        }

        if (!sessionToken.locale) {
          if (request.app.acceptLanguage) {
            // Log details to sanity-check locale backfilling.
            log.info('signer.updateLocale', {
              locale: request.app.acceptLanguage,
            });
            db.updateLocale(sessionToken.uid, request.app.acceptLanguage);
            // meh on the result
          } else {
            // We're seeing a surprising number of accounts that don't get
            // a proper locale.  Log details to help debug this.
            log.info('signer.emptyLocale', {
              email: sessionToken.email,
              locale: request.app.acceptLanguage,
              agent: request.headers['user-agent'],
            });
          }
        }
        const uid = sessionToken.uid;

        const certResult = await signer.sign({
          email: `${uid}@${domain}`,
          publicKey: publicKey,
          domain: domain,
          duration: duration,
          generation: sessionToken.verifierSetAt,
          lastAuthAt: sessionToken.lastAuthAt(),
          verifiedEmail: sessionToken.email,
          deviceId: deviceId,
          tokenVerified: sessionToken.tokenVerified,
          authenticationMethods: Array.from(sessionToken.authenticationMethods),
          authenticatorAssuranceLevel: sessionToken.authenticatorAssuranceLevel,
          profileChangedAt: sessionToken.profileChangedAt,
          keysChangedAt: sessionToken.keysChangedAt,
        });
        request.emitMetricsEvent('account.signed', {
          uid: uid,
          device_id: deviceId,
        });
        return certResult;
      },
    },
  ];

  return routes;
};
