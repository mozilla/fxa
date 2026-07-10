/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ZodError } from 'zod';
import { BaseError } from '@fxa/shared/error';

export class FxaWebhookError extends BaseError {
  constructor(message: string, info: Record<string, any> = {}, cause?: Error) {
    super(message, { info, cause });
    this.name = 'FxaWebhookError';
  }
}

export class FxaWebhookAuthError extends FxaWebhookError {
  constructor(public readonly reason: string = 'unknown') {
    super('FxA webhook authorization failed', { reason });
    this.name = 'FxaWebhookAuthError';
  }
}

export class FxaWebhookUnhandledEventError extends FxaWebhookError {
  constructor(eventUri: string) {
    super('Unhandled FxA webhook event type', { eventUri });
    this.name = 'FxaWebhookUnhandledEventError';
  }
}

export class FxaWebhookJwksError extends FxaWebhookError {
  constructor(message: string) {
    super(message);
    this.name = 'FxaWebhookJwksError';
  }
}

export class FxaWebhookValidationError extends FxaWebhookError {
  constructor(
    public readonly context: string,
    public readonly zodError: ZodError
  ) {
    super(`FxA webhook validation failed: ${context}`, {
      context,
      issues: zodError.issues,
    });
    this.name = 'FxaWebhookValidationError';
  }
}
