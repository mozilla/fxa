/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * CMSError is not intended for direct use, except for type-checking errors.
 * When throwing a new CMSError, create a unique extension of the class.
 */
export class CMSError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'CMSError';
  }
}

export class StrapiQueryError extends CMSError {
  constructor(query: any, variables: Record<string, any>, cause: Error) {
    super('Strapi query failed', { query, variables }, cause);
    this.name = 'StrapiQueryError';
  }
}

export class ProductConfigError extends CMSError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, info, cause);
    this.name = 'ProductConfigError';
  }
}

export class QueriesUtilError extends CMSError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, info, cause);
    this.name = 'QueriesUtilError';
  }
}

export class FetchCmsInvalidOfferingError extends ProductConfigError {
  constructor(error: Error, offeringId: string) {
    super(
      'Invalid offering id',
      {
        offeringId,
      },
      error
    );
    this.name = 'FetchCmsInvalidOfferingError';
  }
}

export class RetrieveStripePriceNotFoundError extends ProductConfigError {
  constructor(offeringId: string, interval: string) {
    super('Price not found', {
      name: 'RetrieveStripePriceNotFoundError',
      info: { offeringId, interval },
    });
    this.name = 'RetrieveStripePriceNotFoundError';
  }
}

export class RetrieveStripePriceInvalidOfferingError extends ProductConfigError {
  constructor(error: Error, offeringId: string) {
    super('Invalid offering id', {
      name: 'RetrieveStripePriceInvalidOfferingError',
      cause: error,
      info: { offeringId },
    });
    this.name = 'RetrieveStripePriceInvalidOfferingError';
  }
}

export class StripeIntervalNotFoundError extends ProductConfigError {
  constructor(interval?: string, intervalCount?: number) {
    super('Stripe interval not found', {
      name: 'StripeIntervalNotFoundError',
      info: { interval, intervalCount },
    });
    this.name = 'StripeIntervalNotFoundError';
  }
}

export class SubPlatIntervalNotFoundError extends ProductConfigError {
  constructor(subplatInterval?: string) {
    super('SubPlat interval not found', {
      name: 'SubPlatIntervalNotFoundError',
      info: { subplatInterval },
    });
    this.name = 'SubPlatIntervalNotFoundError';
  }
}

export class ContentOfferingNotFoundError extends QueriesUtilError {
  constructor() {
    super('Content Offering not found', {});
    this.name = 'ContentOfferingNotFoundError';
  }
}

export class EligibilityContentOfferingNotFoundError extends QueriesUtilError {
  constructor() {
    super('Eligility Content Offering not found', {});
    this.name = 'EligibilityContentOfferingNotFoundError';
  }
}

export class MultipleContentOfferingResultsError extends QueriesUtilError {
  constructor(offeringIds: string[]) {
    super('More than one content offering found', { offeringIds });
    this.name = 'MultipleContentOfferingResultsError';
  }
}

export class MultipleEligilityContentOfferingResultsError extends QueriesUtilError {
  constructor(offeringIds: string[]) {
    super('More than one eligibility content offering found', { offeringIds });
    this.name = 'MultipleEligilityContentOfferingResultsError';
  }
}
