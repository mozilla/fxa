/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const buf = require('buf').hex;
const Joi = require('joi');

const AppError = require('./error');
const validators = require('./validators');
const db = require('./db');
const encrypt = require('./encrypt');
const logger = require('./logging')('client');

// Client credentials can be provided in either the Authorization header
// or the request body, but not both.
// These are some re-useable validators to assert that requirement.
module.exports.clientAuthValidators = {
  headers: Joi.object({
    authorization: Joi.string()
      .regex(validators.BASIC_AUTH_HEADER)
      .optional(),
  }).options({ allowUnknown: true, stripUnknown: false }),

  // The use of `$headers` here is Joi syntax for a "context reference"
  // as described at https://hapi.dev/family/joi/?v=16.1.4#refkey-options.
  // Hapi provides the headers as part of the context when validating request payload,
  // as noted in https://github.com/hapijs/hapi/blob/master/API.md#-routeoptionsresponseschema.
  clientId: validators.clientId.when('$headers.authorization', {
    is: Joi.string().required(),
    then: Joi.forbidden(),
  }),

  clientSecret: validators.clientSecret
    .when('$headers.authorization', {
      is: Joi.string().required(),
      then: Joi.forbidden(),
    })
    .optional(),
};

/**
 * Extract and normalize client credentials from a request.
 * Clients may provide credentials in either the Authorization header
 * or the request body, but not both.
 *
 * @param {Object} headers the headers from the request
 * @param {Object} params the payload from the request
 * @returns {Object} credentials
 *   @param {String} client_id
 *   @param {String} [client_secret]
 */
module.exports.getClientCredentials = function getClientCredentials(
  headers,
  params
) {
  const creds = {};
  creds.client_id = params.client_id;
  if (params.client_secret) {
    creds.client_secret = params.client_secret;
  }

  // Clients are allowed to provide credentials in either
  // the Authorization header or request body, but not both.
  if (headers.authorization) {
    const authzMatch = validators.BASIC_AUTH_HEADER.exec(headers.authorization);
    const err = new AppError.invalidRequestParameter('authorization');
    if (!authzMatch || creds.client_id || creds.client_secret) {
      throw err;
    }
    const [clientId, clientSecret, ...rest] = Buffer.from(
      authzMatch[1],
      'base64'
    )
      .toString()
      .split(':');
    if (rest.length !== 0) {
      throw err;
    }
    creds.client_id = Joi.attempt(clientId, validators.clientId, err);
    creds.client_secret = Joi.attempt(
      clientSecret,
      validators.clientSecret,
      err
    );
  }

  return creds;
};

/**
 * Authenticate a request made by an OAuth client, using credentials from
 * either the Authorization header or request body parameters.
 *
 * @param {Object} headers the headers from the request
 * @param {Object} params the payload from the request
 * @returns {Promise} resolves with info about the client, or
 *                    rejects if invalid credentials were provided
 */
module.exports.authenticateClient = async function authenticateClient(
  headers,
  params
) {
  const creds = exports.getClientCredentials(headers, params);

  const client = await getClientById(creds.client_id);

  // Public clients can't be authenticated in any useful way,
  // and should never submit a client_secret.
  if (client.publicClient) {
    if (creds.client_secret) {
      throw new AppError.invalidRequestParameter('client_secret');
    }
    return client;
  }

  // Check client_secret against both current and previous stored secrets,
  // to allow for seamless rotation of the secret.
  if (!creds.client_secret) {
    throw new AppError.invalidRequestParameter('client_secret');
  }
  const submitted = encrypt.hash(buf(creds.client_secret));
  const stored = client.hashedSecret;
  if (crypto.timingSafeEqual(submitted, stored)) {
    return client;
  }
  const storedPrevious = client.hashedSecretPrevious;
  if (storedPrevious) {
    if (crypto.timingSafeEqual(submitted, storedPrevious)) {
      logger.info('client.matchSecretPrevious', { client: client.id });
      return client;
    }
  }
  logger.info('client.mismatchSecret', { client: client.id });
  logger.verbose('client.mismatchSecret.details', {
    submitted: submitted,
    db: stored,
    dbPrevious: storedPrevious,
  });
  throw AppError.incorrectSecret(client.id);
};

async function getClientById(clientId) {
  const client = await db.getClient(buf(clientId));
  if (!client) {
    logger.debug('client.notFound', { id: clientId });
    throw AppError.unknownClient(clientId);
  }
  return client;
}
