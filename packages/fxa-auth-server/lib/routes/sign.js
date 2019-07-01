/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const P = require('../promise');
const validators = require('./validators');

module.exports = (log, signer, db, domain, devices) => {
  const HOUR = 1000 * 60 * 60;

  const routes = [
    {
      method: 'POST',
      path: '/certificate/sign',
      options: {
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          query: {
            service: validators.service,
          },
          payload: {
            publicKey: isA
              .object({
                algorithm: isA
                  .string()
                  .valid('RS', 'DS')
                  .required(),
                n: isA.string(),
                e: isA.string(),
                y: isA.string(),
                p: isA.string(),
                q: isA.string(),
                g: isA.string(),
                version: isA.string(),
              })
              .required(),
            duration: isA
              .number()
              .integer()
              .min(0)
              .max(24 * HOUR)
              .required(),
          },
        },
      },
      handler: async function certificateSign(request) {
        log.begin('Sign.cert', request);
        const sessionToken = request.auth.credentials;
        const publicKey = request.payload.publicKey;
        const duration = request.payload.duration;
        const service = request.query.service;
        let deviceId, uid, certResult;
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

        return P.resolve()
          .then(() => {
            if (sessionToken.deviceId) {
              deviceId = sessionToken.deviceId;
            } else if (!service || service === 'sync') {
              // Synthesize a device record for Sync sessions that don't already have one.
              // Include the UA info so that we can synthesize a device name
              // for any push notifications.
              const deviceInfo = {
                uaBrowser: sessionToken.uaBrowser,
                uaBrowserVersion: sessionToken.uaBrowserVersion,
                uaOS: sessionToken.uaOS,
                uaOSVersion: sessionToken.uaOSVersion,
              };
              return devices
                .upsert(request, sessionToken, deviceInfo)
                .then(result => {
                  deviceId = result.id;
                })
                .catch(err => {
                  // There's a small chance that a device registration was performed
                  // concurrently.  If so, just use that device id.
                  if (err.errno !== error.ERRNO.DEVICE_CONFLICT) {
                    throw err;
                  }
                  deviceId = err.output.payload.deviceId;
                });
            }
          })
          .then(() => {
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
            uid = sessionToken.uid;

            return signer.sign({
              email: `${uid}@${domain}`,
              publicKey: publicKey,
              domain: domain,
              duration: duration,
              generation: sessionToken.verifierSetAt,
              lastAuthAt: sessionToken.lastAuthAt(),
              verifiedEmail: sessionToken.email,
              deviceId: deviceId,
              tokenVerified: sessionToken.tokenVerified,
              authenticationMethods: Array.from(
                sessionToken.authenticationMethods
              ),
              authenticatorAssuranceLevel:
                sessionToken.authenticatorAssuranceLevel,
              profileChangedAt: sessionToken.profileChangedAt,
            });
          })
          .then(result => {
            certResult = result;
            return request.emitMetricsEvent('account.signed', {
              uid: uid,
              device_id: deviceId,
            });
          })
          .then(() => {
            return certResult;
          });
      },
    },
  ];

  return routes;
};
