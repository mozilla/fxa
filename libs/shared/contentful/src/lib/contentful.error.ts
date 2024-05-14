/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError, BaseMultiError } from '@fxa/shared/error';

/**
 * Thrown as a wrapper for multiple query errors
 */
export class ContentfulError extends BaseMultiError {
  constructor(...args: ConstructorParameters<typeof BaseMultiError>) {
    super(...args);
  }
}

/**
 * Thrown when errors are returned in the Contentful CDN response
 */
export class ContentfulCDNError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}

/**
 * https://www.contentful.com/developers/docs/references/graphql/#/reference/graphql-errors
 */
export class ContentfulCDNExecutionError extends ContentfulCDNError {
  constructor(...args: ConstructorParameters<typeof ContentfulQueryError>) {
    super(...args);
  }
}

/**
 * Thrown when errors are returned in the Contentful GraphQL response
 */
export class ContentfulQueryError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}

export class ContentfulServiceError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}
