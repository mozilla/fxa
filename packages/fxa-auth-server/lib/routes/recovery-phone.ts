/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  RecoveryPhoneService,
  RecoveryNumberNotSupportedError,
  RecoveryNumberInvalidFormatError,
  RecoveryNumberAlreadyExistsError,
} from '@fxa/accounts/recovery-phone';
import * as isA from 'joi';
import { GleanMetricsType } from '../metrics/glean';
import { AuthLogger, AuthRequest } from '../types';
import { E164_NUMBER } from './validators';
import AppError from '../error';
const { Container } = require('typedi');

class RecoveryPhoneHandler {
  private readonly recoveryPhoneService: RecoveryPhoneService;
  constructor(
    private readonly log: AuthLogger,
    private readonly glean: GleanMetricsType
  ) {
    this.recoveryPhoneService = Container.get('RecoveryPhoneService');
  }

  async setupPhoneNumber(request: AuthRequest) {
    const { uid } = request.auth.credentials as unknown as { uid: string };
    const { phoneNumber } = request.payload as unknown as {
      phoneNumber: string;
    };

    try {
      const result = await this.recoveryPhoneService.setupPhoneNumber(
        uid,
        phoneNumber
      );
      if (result) {
        await this.glean.twoFactorAuthSetup.sentPhoneCode(request);
        return { status: 'success' };
      }
      await this.glean.twoFactorAuthSetup.sendPhoneCodeError(request);
      return { status: 'failure' };
    } catch (error) {
      await this.glean.twoFactorAuthSetup.sendPhoneCodeError(request);

      if (
        error instanceof RecoveryNumberInvalidFormatError ||
        error instanceof RecoveryNumberNotSupportedError ||
        error instanceof RecoveryNumberAlreadyExistsError
      ) {
        throw AppError.invalidPhoneNumber();
      }

      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'setupPhoneNumber',
        { uid },
        error
      );
    }
  }
}

export const recoveryPhoneRoutes = (
  log: AuthLogger,
  glean: GleanMetricsType
) => {
  const recoveryPhoneHandler = new RecoveryPhoneHandler(log, glean);
  const routes = [
    // TODO: See blocked tasks for FXA-10354
    {
      method: 'POST',
      path: '/recovery-phone/create',
      options: {
        auth: {
          strategies: ['sessionToken'],
        },
        validate: {
          payload: isA.object({
            phoneNumber: isA.string().regex(E164_NUMBER).required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        return recoveryPhoneHandler.setupPhoneNumber(request);
      },
    },
  ];

  return routes;
};
