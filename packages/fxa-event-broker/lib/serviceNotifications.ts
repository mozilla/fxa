/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as sentry from '@sentry/node';
import { Logger } from 'mozlog';
import joi from 'typesafe-joi';

// Event strings
export const LOGIN_EVENT = 'login';
export const SUBSCRIPTION_UPDATE_EVENT = 'subscription:update';
export const DELETE_EVENT = 'delete';

// Message schemas
const BASE_MESSAGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().required()
  })
  .unknown(true)
  .required();

const LOGIN_SCHEMA = joi
  .object()
  .keys({
    clientId: joi.string().optional(),
    deviceCount: joi
      .number()
      .integer()
      .required(),
    email: joi.string().required(),
    event: joi
      .string()
      .valid(LOGIN_EVENT)
      .required(),
    service: joi.string().optional(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required(),
    userAgent: joi.string().optional()
  })
  .unknown(true)
  .required();

const SUBSCRIPTION_UPDATE_SCHEMA = joi
  .object()
  .keys({
    event: joi
      .string()
      .valid(SUBSCRIPTION_UPDATE_EVENT)
      .required(),
    eventCreatedAt: joi
      .number()
      .integer()
      .required(),
    isActive: joi.bool().required(),
    productCapabilities: joi
      .array()
      .items(joi.string())
      .required(),
    productId: joi.string().optional(),
    // TODO: productName is the legacy name for productId, remove it
    //       in due course then make productId required again.
    productName: joi.string().optional(),
    subscriptionId: joi.string().required(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

const DELETE_SCHEMA = joi
  .object()
  .keys({
    event: joi
      .string()
      .valid(DELETE_EVENT)
      .required(),
    timestamp: joi.number().optional(),
    ts: joi.number().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

export type loginSchema = joi.Literal<typeof LOGIN_SCHEMA>;
export type subscriptionUpdateSchema = joi.Literal<typeof SUBSCRIPTION_UPDATE_SCHEMA>;
export type deleteSchema = joi.Literal<typeof DELETE_SCHEMA>;

export type ServiceNotification = loginSchema | subscriptionUpdateSchema | deleteSchema | undefined;

interface SchemaTable {
  [key: string]: joi.ObjectSchema<any>;
}

// Event Schema Map
const eventSchemas = {
  [LOGIN_EVENT]: LOGIN_SCHEMA,
  [SUBSCRIPTION_UPDATE_EVENT]: SUBSCRIPTION_UPDATE_SCHEMA,
  [DELETE_EVENT]: DELETE_SCHEMA
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
  }
};
