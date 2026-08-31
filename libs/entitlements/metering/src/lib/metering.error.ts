/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class MeteringError extends BaseError {
  constructor(message: string, info: Record<string, unknown>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'MeteringError';
  }
}

export class ClickHouseError extends MeteringError {
  constructor(operation: string, cause: Error) {
    super('ClickHouse request failed', { operation }, cause);
    this.name = 'ClickHouseError';
  }
}

export class ClickHouseTableNameError extends MeteringError {
  constructor(identifier: string) {
    super('ClickHouse identifier is not a valid table name', { identifier });
    this.name = 'ClickHouseTableNameError';
  }
}

export class InvalidMeteringEventError extends MeteringError {
  constructor(issuePaths: string[]) {
    super('Metering event failed schema validation', { issuePaths });
    this.name = 'InvalidMeteringEventError';
  }
}

export class EmptyClientSecretError extends MeteringError {
  constructor(clientId: string) {
    super('Metering client is configured with an empty secret', { clientId });
    this.name = 'EmptyClientSecretError';
  }
}

export class MissingClientSecretError extends MeteringError {
  constructor(signingClientId: string, slug: string) {
    super('No signing secret is configured for this metering client', {
      signingClientId,
      slug,
    });
    this.name = 'MissingClientSecretError';
  }
}

export class WebhookDispatchError extends MeteringError {
  constructor(
    info: { signingClientId: string; slug: string; status?: number },
    cause?: Error
  ) {
    super('Webhook dispatch failed', info, cause);
    this.name = 'WebhookDispatchError';
  }
}

export class DedupeError extends MeteringError {
  constructor(operation: string, cause: Error) {
    super('Redis dedupe request failed', { operation }, cause);
    this.name = 'DedupeError';
  }
}

export class SessionUsageQueryNotSupportedError extends MeteringError {
  constructor(slug: string) {
    super('Usage queries are not supported for session meters', { slug });
    this.name = 'SessionUsageQueryNotSupportedError';
  }
}

export class TimestampOutOfRangeError extends MeteringError {
  constructor(timestamp: string) {
    super('Usage event timestamp is outside the accepted range', {
      timestamp,
    });
    this.name = 'TimestampOutOfRangeError';
  }
}

export class PublishError extends MeteringError {
  constructor(cause: Error) {
    super('Failed to publish usage event', {}, cause);
    this.name = 'PublishError';
  }
}

export class MeterNotConfiguredError extends MeteringError {
  constructor(slug: string) {
    super('Meter slug is not configured', { slug });
    this.name = 'MeterNotConfiguredError';
  }
}

export class UsageGrantLifetimeNotSupportedError extends MeteringError {
  constructor(slug: string, lifetime: string, windowKind: string) {
    super('Usage grant lifetime is not supported for this meter window', {
      slug,
      lifetime,
      windowKind,
    });
    this.name = 'UsageGrantLifetimeNotSupportedError';
  }
}

export class UsageGrantNotFoundError extends MeteringError {
  constructor(grantId: string) {
    super('Usage grant not found', { grantId });
    this.name = 'UsageGrantNotFoundError';
  }
}
