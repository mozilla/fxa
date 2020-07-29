/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

const logger = require('../../logging')('routes.ecosystem_anon_id.post');
const notifyProfileUpdated = require('../../updates-queue');
const AppError = require('../../error');
const config = require('../../config');
const request = require('../../request');
const crypto = require('crypto');

const AUTH_SERVER_URL =
  config.get('authServer.url') + '/account/ecosystemAnonId';

const updateAuthServer = function (
  credentials,
  ecosystemAnonId,
  ifNoneMatch,
  ifMatch
) {
  const headers = {
    Authorization: 'Bearer ' + credentials.token,
  };

  if (ifNoneMatch) {
    headers['If-None-Match'] = ifNoneMatch;
  }

  if (ifMatch) {
    headers['If-Match'] = ifMatch;
  }

  return new Promise((resolve, reject) => {
    request.put(
      AUTH_SERVER_URL,
      {
        headers,
        body: {
          ecosystemAnonId,
        },
        json: true,
      },
      (err, res, body) => {
        if (err) {
          logger.error('request.auth_server.network', err);
          return reject(new AppError.authError('network error'));
        }

        if (res.statusCode >= 400) {
          body = body && body.code ? body : { code: res.statusCode };

          if (res.statusCode >= 500) {
            logger.error('request.auth_server.fail', body);
            return reject(new AppError.authError('auth-server server error'));
          }

          if (body.code === 401 || body.errno === 102) {
            logger.info('request.auth_server.fail', body);
            return reject(new AppError.unauthorized(body.message));
          }

          if (body.code === 412 || body.errno === 190) {
            logger.info('request.auth_server.precondition_fail', body);
            return reject(
              new AppError.anonIdUpdateConflict(null, body.message)
            );
          }

          logger.error('request.auth_server.fail', body);
          return reject(
            new AppError({
              code: 500,
              message: 'error communicating with auth server',
            })
          );
        }

        return resolve();
      }
    );
  });
};

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:ecosystem_anon_id:write'],
  },
  validate: {
    payload: {
      ecosystemAnonId: Joi.string().required(),
    },
  },
  handler: async function ecosystemAnonIdPost(req) {
    return req.server
      .inject({
        allowInternals: true,
        method: 'get',
        url: '/v1/_core_profile',
        headers: req.headers,
        auth: {
          credentials: req.auth.credentials,
          strategy: 'oauth',
        },
      })
      .then(async (res) => {
        function hashAnonId(anonId) {
          const hash = crypto.createHash('sha256');
          return hash.update(anonId).digest('hex');
        }

        const uid = req.auth.credentials.user;
        const existingAnonId = res.result.ecosystemAnonId;
        const ifNoneMatch = req.headers['if-none-match'];
        const ifMatch = req.headers['if-match'];

        logger.info('activityEvent', {
          event: 'ecosystemAnonId.post',
          uid: uid,
        });

        if (existingAnonId && (ifNoneMatch || ifMatch)) {
          const hashedAnonId = hashAnonId(existingAnonId);

          if (ifMatch && ifMatch !== hashedAnonId) {
            throw AppError.anonIdUpdateConflict('If-Match');
          }

          if (ifNoneMatch === '*') {
            throw AppError.anonIdUpdateConflict('If-None-Match');
          } else if (ifNoneMatch === hashedAnonId) {
            throw AppError.anonIdUpdateConflict('If-None-Match');
          }
        }

        await req.server.methods.profileCache.drop(uid);
        await updateAuthServer(
          req.auth.credentials,
          req.payload.ecosystemAnonId,
          req.headers['if-none-match'],
          req.headers['if-match']
        );

        notifyProfileUpdated(uid);
        return {};
      });
  },
};
