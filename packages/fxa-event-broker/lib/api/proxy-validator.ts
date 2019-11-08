/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import joi from 'typesafe-joi';

export const proxyPayloadValidator = joi
  .object({
    message: joi
      .object({
        attributes: joi.object().unknown(true),
        data: joi.string().required(),
        messageId: joi.string().required()
      })
      .unknown(true)
      .required(),
    subscription: joi.string().required()
  })
  .required();

export type proxyPayload = joi.Literal<typeof proxyPayloadValidator>;
