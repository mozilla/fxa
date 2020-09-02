/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
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
export const CLIENT_ID = joi.string().regex(/[a-z0-9]{16}/);

export const BASE_MESSAGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().required(),
  })
  .unknown(true)
  .required();

export const LOGIN_SCHEMA = joi
  .object()
  .keys({
    clientId: CLIENT_ID.optional(),
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

export const SUBSCRIPTION_UPDATE_SCHEMA = joi
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

export const DELETE_SCHEMA = joi
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
export const PASSWORD_CHANGE_SCHEMA = joi
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
export const PROFILE_CHANGE_SCHEMA = joi
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
export type subscriptionUpdateSchema = joi.Literal<
  typeof SUBSCRIPTION_UPDATE_SCHEMA
>;
