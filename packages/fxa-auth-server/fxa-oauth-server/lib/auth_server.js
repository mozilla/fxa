/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const createBackendServiceAPI = require('../../lib/backendService');
const Joi = require('joi');
const { signJWT } = require('../../lib/serverJWT');
const AppError = require('./error');

module.exports = (log, config) => {
  const AuthServerAPI = createBackendServiceAPI(log, config, 'auth', {
    getUserProfile: {
      path: config.auth.url.endsWith('/auth')
        ? '/auth/v1/account/profile'
        : '/v1/account/profile',
      method: 'GET',
      validate: {
        headers: {
          authorization: Joi.string().required(),
        },
        response: {
          email: Joi.string().optional(),
          locale: Joi.string()
            .optional()
            .allow(null),
          authenticationMethods: Joi.array()
            .items(Joi.string().required())
            .optional(),
          authenticatorAssuranceLevel: Joi.number().min(0),
          subscriptions: Joi.array()
            .items(Joi.string().required())
            .optional(),
          profileChangedAt: Joi.number().min(0),
        },
      },
    },
  });

  const api = new AuthServerAPI(config.auth.url, config.auth.poolee);

  return {
    api,

    close() {
      api.close();
    },

    async getUserProfile({ client_id, scope, uid }) {
      const claims = {
        client_id,
        scope,
        sub: uid,
      };
      const jwt = await signJWT(
        claims,
        config.auth.url,
        config.audience,
        config.auth.jwtSecretKey
      );
      try {
        return await api.getUserProfile({ authorization: `OAuthJWT ${jwt}` });
      } catch (error) {
        throw this.mapAuthError(error);
      }
    },

    mapAuthError(error) {
      // If it's already an instance of our internal error type,
      // then just return it as-is.
      if (error instanceof AppError) {
        return error;
      }
      if (!error.errno) {
        // If there's no `errno`, it must be some sort of internal implementation error.
        // Let it bubble up and be caught by the top-level unexpected-error-handling logic.
        throw error;
      }

      switch (error.errno) {
        case 110: {
          return AppError.invalidToken();
        }
        case 998: {
          let key;
          try {
            key = Object.keys(error.output.payload.data.value)[0];
          } catch (e) {
            // ignore, no key found
          }
          return AppError.invalidRequestParameter(key);
        }
        default: {
          log.warn('auth_server.mapAuthError', {
            err: error,
            errno: error.errno,
            warning: 'unmapped auth-server errno',
          });
          return AppError.unexpectedError();
        }
      }
    },
  };
};
