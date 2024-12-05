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

enum RecoveryPhoneStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

class RecoveryPhoneHandler {
  private readonly recoveryPhoneService: RecoveryPhoneService;

  constructor(
    private readonly log: AuthLogger,
    private readonly glean: GleanMetricsType
  ) {
    this.recoveryPhoneService = Container.get('RecoveryPhoneService');
  }

  async sendCode(request: AuthRequest) {
    const { uid } = request.auth.credentials as unknown as { uid: string };

    let status = false;
    try {
      status = await this.recoveryPhoneService.sendCode(uid);
    } catch (error) {
      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'sendCode',
        { uid },
        error
      );
    }

    if (status) {
      await this.glean.twoStepAuthPhoneCode.sent(request);
      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    await this.glean.twoStepAuthPhoneCode.sendError(request);
    return { status: RecoveryPhoneStatus.FAILURE };
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
        await this.glean.twoStepAuthPhoneCode.sent(request);
        return { status: RecoveryPhoneStatus.SUCCESS };
      }
      await this.glean.twoStepAuthPhoneCode.sendError(request);
      return { status: RecoveryPhoneStatus.FAILURE };
    } catch (error) {
      await this.glean.twoStepAuthPhoneCode.sendError(request);

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

  async confirm(request: AuthRequest) {
    const { uid } = request.auth.credentials as unknown as { uid: string };
    const { code } = request.payload as unknown as {
      code: string;
    };

    let success = false;
    try {
      success = await this.recoveryPhoneService.confirmCode(uid, code);
    } catch (error) {
      throw AppError.backendServiceFailure(
        'RecoveryPhoneService',
        'confirmCode',
        { uid },
        error
      );
    }

    if (success) {
      await this.glean.twoStepAuthPhoneCode.complete(request);
      return { status: RecoveryPhoneStatus.SUCCESS };
    }

    throw AppError.invalidOrExpiredOtpCode();
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
    {
      method: 'POST',
      path: '/recovery-phone/confirm',
      options: {
        auth: {
          strategies: ['sessionToken'],
        },
        validate: {
          payload: isA.object({
            code: isA.string().min(8).max(8),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        return recoveryPhoneHandler.confirm(request);
      },
    },
    {
      method: 'POST',
      path: '/recovery-phone/send_code',
      options: {
        auth: {
          strategies: ['sessionToken'],
        },
      },
      handler: function (request: AuthRequest) {
        return recoveryPhoneHandler.sendCode(request);
      },
    },
  ];

  return routes;
};
