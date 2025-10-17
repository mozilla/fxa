/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * AppleIapError is not intended for direct use, except for type-checking errors.
 * When throwing a new AppleIapError, create a unique extension of the class.
 */
export class StripeWebhookEventError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'StripeWebhookEventError';
  }
}

export class StripeEventCreateError extends StripeWebhookEventError {
  constructor(eventId: string) {
    super('Failed to create Stripe Event record', { eventId });
    this.name = 'StripeEventCreateError';
  }
}

export class StripeEventNotFoundError extends StripeWebhookEventError {
  constructor(eventId: string) {
    super('Stripe event not found', { eventId });
    this.name = 'StripeEventNotFoundError';
  }
}

export class StripeEventMissingRequiredError extends StripeWebhookEventError {
  constructor(eventId: string, fields: string[]) {
    super('Stripe Event is missing required fields', { eventId, fields });
    this.name = 'StripeEventMissingRequiredError';
  }
}

export class StripeEventMissingUpdateParamsError extends StripeWebhookEventError {
  constructor(eventId: string) {
    super('Must provide at least one update param', { eventId });
    this.name = 'StripeEventMissingUpdateParamsError';
  }
}
