/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { RecoveryPhoneService } from '@fxa/accounts/recovery-phone';
import AppError from '../../error';

export const strategy = function () {
  // Resolve the recovery phone service from typedi. This service
  // is a wrapper around the calls to the twilio sdk needed to
  // authenticate incoming requests.
  const recoveryPhoneService = Container.get(RecoveryPhoneService);
  if (!recoveryPhoneService) {
    throw new Error('RecoveryPhoneService not registered with typedi');
  }

  return () => ({
    authenticate: async function (req: Request, h: ResponseToolkit) {
      const signature = req.headers['X-Twilio-Signature'];
      if (!signature) {
        throw AppError.unauthorized('X-Twilio-Signature header missing');
      }

      if (typeof req.payload !== 'object') {
        throw AppError.unauthorized('Invalid payload');
      }

      const valid = recoveryPhoneService.validateTwilioSignature(
        req.headers['X-Twilio-Signature'],
        req.payload
      );

      // Signature invalid. Deny request
      if (!valid) {
        throw AppError.unauthorized('X-Twilio-Signature header invalid');
      }
      return { signature };
    },
  });
};
