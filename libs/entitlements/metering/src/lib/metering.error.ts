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

export class OpenMeterQueryError extends MeteringError {
  constructor(cause: Error) {
    super('Failed to query usage from OpenMeter', {}, cause);
    this.name = 'OpenMeterQueryError';
  }
}

export class MeteringBufferOverflowError extends MeteringError {
  constructor() {
    super('Metering ingest buffer is full', {});
    this.name = 'MeteringBufferOverflowError';
  }
}

export class MeterNotConfiguredError extends MeteringError {
  constructor(slug: string) {
    super('Meter slug is not configured', { slug });
    this.name = 'MeterNotConfiguredError';
  }
}
