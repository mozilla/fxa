/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as sentry from '@sentry/node';
import { Logger } from 'mozlog';
import joi from 'typesafe-joi';

// Event strings
export const DELETE_EVENT = 'delete';
export const LOGIN_EVENT = 'login';
export const PASSWORD_CHANGE_EVENT = 'passwordChange';
export const PASSWORD_RESET_EVENT = 'reset';
export const PRIMARY_EMAIL_EVENT = 'primaryEmailChanged';
export const PROFILE_CHANGE_EVENT = 'profileDataChange';
export const SUBSCRIPTION_UPDATE_EVENT = 'subscription:update';

// Message schemas
const BASE_MESSAGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().required(),
  })
  .unknown(true)
  .required();

const LOGIN_SCHEMA = joi
  .object()
  .keys({
    clientId: joi.string().optional(),
    deviceCount: joi.number().integer().required(),
    email: joi.string().required(),
    event: joi.string().valid(LOGIN_EVENT).required(),
    service: joi.string().optional(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
    userAgent: joi.string().optional(),
  })
  .unknown(true)
  .required();

const SUBSCRIPTION_UPDATE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().valid(SUBSCRIPTION_UPDATE_EVENT).required(),
    eventCreatedAt: joi.number().integer().required(),
    isActive: joi.bool().required(),
    productCapabilities: joi.array().items(joi.string()).required(),
    productId: joi.string().optional(),
    // TODO: productName is the legacy name for productId, remove it
    //       in due course then make productId required again.
    productName: joi.string().optional(),
    subscriptionId: joi.string().required(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
  })
  .unknown(true)
  .required();

const DELETE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().valid(DELETE_EVENT).required(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
  })
  .unknown(true)
  .required();

// Whether its a password change or reset, the service must handle it the
// same so we only pass that the prior password is no longer valid.
const PASSWORD_CHANGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().valid(PASSWORD_CHANGE_EVENT, PASSWORD_RESET_EVENT),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
  })
  .unknown(true)
  .required();

// Whether its the primary email, or some other data in the profile changing, the
// profile has changed and a new request should be made to handle it.
const PROFILE_CHANGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().valid(PRIMARY_EMAIL_EVENT, PROFILE_CHANGE_EVENT),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
  })
  .unknown(true)
  .required();

export type deleteSchema = joi.Literal<typeof DELETE_SCHEMA>;
export type loginSchema = joi.Literal<typeof LOGIN_SCHEMA>;
export type passwordSchema = joi.Literal<typeof PASSWORD_CHANGE_SCHEMA>;
export type profileSchema = joi.Literal<typeof PROFILE_CHANGE_SCHEMA>;
export type subscriptionUpdateSchema = joi.Literal<typeof SUBSCRIPTION_UPDATE_SCHEMA>;

export type ServiceNotification =
  | deleteSchema
  | loginSchema
  | passwordSchema
  | profileSchema
  | subscriptionUpdateSchema
  | undefined;

interface SchemaTable {
  [key: string]: joi.ObjectSchema<any>;
}

// Event Schema Map
const eventSchemas = {
  [LOGIN_EVENT]: LOGIN_SCHEMA,
  [SUBSCRIPTION_UPDATE_EVENT]: SUBSCRIPTION_UPDATE_SCHEMA,
  [DELETE_EVENT]: DELETE_SCHEMA,
  [PROFILE_CHANGE_EVENT]: PROFILE_CHANGE_SCHEMA,
  [PRIMARY_EMAIL_EVENT]: PROFILE_CHANGE_SCHEMA,
  [PASSWORD_CHANGE_EVENT]: PASSWORD_CHANGE_SCHEMA,
  [PASSWORD_RESET_EVENT]: PASSWORD_CHANGE_SCHEMA,
};

/**
 * Attempt to validate and return one of a map of schemas based on the
 * messages event type matching a schema map key.
 *
 * Note: Due to using `any` in the `SchemaTable` value, this is not actually
 * type-safe.
 *
 * @param schemaTable
 * @param rawMessage
 */
function multiSchemaAttempt(
  schemaTable: SchemaTable,
  rawMessage: object
): ServiceNotification | undefined {
  const message = joi.attempt(rawMessage, BASE_MESSAGE_SCHEMA);
  if (schemaTable[message.event]) {
    return joi.attempt(message, schemaTable[message.event]);
  }
  return;
}

export const ServiceNotification = {
  from(logger: Logger, rawMessage: object): ServiceNotification | undefined {
    try {
      const validMessage = multiSchemaAttempt(eventSchemas, rawMessage);
      if (validMessage) {
        logger.debug('from.sqsMessage', { msg: validMessage });
        return validMessage;
      }
    } catch (err) {
      sentry.captureException(err);
      logger.error('from.sqsMessage', { message: 'Invalid message', err });
    }
    return;
  },
};
