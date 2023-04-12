/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as Sentry from '@sentry/node';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import joi from 'joi';

import * as dto from './sqs.dto';

export type ServiceNotification =
  | dto.deleteSchema
  | dto.loginSchema
  | dto.passwordSchema
  | dto.profileSchema
  | dto.subscriptionUpdateSchema
  | undefined;

interface SchemaTable {
  [key: string]: joi.ObjectSchema<any>;
}

// Event Schema Map
const eventSchemas = {
  [dto.LOGIN_EVENT]: dto.LOGIN_SCHEMA,
  [dto.SUBSCRIPTION_UPDATE_EVENT]: dto.SUBSCRIPTION_UPDATE_SCHEMA,
  [dto.DELETE_EVENT]: dto.DELETE_SCHEMA,
  [dto.PROFILE_CHANGE_EVENT]: dto.PROFILE_CHANGE_SCHEMA,
  [dto.PRIMARY_EMAIL_EVENT]: dto.PROFILE_CHANGE_SCHEMA,
  [dto.PASSWORD_CHANGE_EVENT]: dto.PASSWORD_CHANGE_SCHEMA,
  [dto.PASSWORD_RESET_EVENT]: dto.PASSWORD_CHANGE_SCHEMA,
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
  rawMessage: Record<string, unknown>
): ServiceNotification | undefined {
  const message = joi.attempt(rawMessage, dto.BASE_MESSAGE_SCHEMA);
  if (schemaTable[message.event]) {
    return joi.attempt(message, schemaTable[message.event]);
  }
  return;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ServiceNotification = {
  from(
    logger: MozLoggerService,
    rawMessage: Record<string, unknown>
  ): ServiceNotification | undefined {
    try {
      const validMessage = multiSchemaAttempt(eventSchemas, rawMessage);
      if (validMessage) {
        logger.debug('from.sqsMessage', { msg: validMessage });
        return validMessage;
      }
    } catch (err) {
      Sentry.captureException(err);
      logger.error('from.sqsMessage', {
        message: 'Invalid message',
        err,
      });
    }
    return;
  },
};
