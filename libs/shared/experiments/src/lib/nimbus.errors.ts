/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
import type { NimbusContext } from './nimbus.types';

/**
 * Nimbus is not intended for direct use, except for type-checking errors.
 * When throwing a new AppleIapError, create a unique extension of the class.
 */
export class NimbusError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'NimbusError';
  }
}

export class NimbusClientFetchExperimentsHandledError extends NimbusError {
  constructor(
    errorResponse: any,
    params: {
      clientId: string;
      context: NimbusContext;
    }
  ) {
    super('Error ocurred while fetching experiments', {
      errorResponse,
      params,
    });
    this.name = 'NimbusClientFetchExperimentsError';
  }
}

export class NimbusClientFetchExperimentsUnexpectedError extends NimbusError {
  constructor(
    cause: Error,
    params: {
      clientId: string;
      context: NimbusContext;
    }
  ) {
    super('Error ocurred while fetching experiments', { params }, cause);
    this.name = 'NimbusClientFetchExperimentsUnexpectedError';
  }
}
