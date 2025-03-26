/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError, BaseMultiError } from '@fxa/shared/error';

/**
 * Thrown as a wrapper for multiple query errors
 */
export class CMSError extends BaseMultiError {
  constructor(...args: ConstructorParameters<typeof BaseMultiError>) {
    super(...args);
  }
}

export class ProductConfigError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}

export class QueriesUtilError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}

export class FetchCmsInvalidOfferingError extends ProductConfigError {
  constructor(error: Error, offeringId: string) {
    super('Invalid offering id', {
      name: 'FetchCmsInvalidOfferingError',
      cause: error,
      info: { offeringId },
    });
  }
}

export class RetrieveStripePriceNotFoundError extends ProductConfigError {
  constructor(offeringId: string, interval: string) {
    super('Price not found', {
      name: 'RetrieveStripePriceNotFoundError',
      info: { offeringId, interval },
    });
  }
}

export class RetrieveStripePriceInvalidOfferingError extends ProductConfigError {
  constructor(error: Error, offeringId: string) {
    super('Invalid offering id', {
      name: 'RetrieveStripePriceInvalidOfferingError',
      cause: error,
      info: { offeringId },
    });
  }
}

export class OfferingNotFoundError extends QueriesUtilError {
  constructor() {
    super('Offering not found');
  }
}

export class OfferingMultipleError extends QueriesUtilError {
  constructor() {
    super('More than one offering found');
  }
}
